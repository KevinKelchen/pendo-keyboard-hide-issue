/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PendoService {

  pendoInstance: pendo.Pendo;

  async init() {
    // If we haven't yet fetched the API, do so now
    if (!this.pendoInstance) {
      this.pendoInstance = await downloadPendo();
    }

    // If pendo did not download, get out.
    if (!this.pendoInstance) {
      // sample-awareness: Replace sending failure events to Sentry with `console.error()`.
      console.error('Pendo failed to load');
      return;
    }

    const opts = {
      // sample-awareness: Replace these with your own values that meet the criteria for showing the guide.
      visitor: { id: '' },
      account: { id: '' },
    };

    // sample-awareness: This, as well as other code in this file, has been commented-out
    // because it's not necessary to reproduce the issue.
    // try {
    //   // Since these are undocumented APIs, wrap them in a try-catch.
    //   // Note: this is specifically being called BEFORE initialize/identify due to a bug we logged with Pendo
    //   // For more details, see /docs/issues/support-cases/pendo-57129/pendo-57129.md
    //   if (!this.pendoInstance.isSendingEvents()) {this.pendoInstance.startSendingEvents();}
    // } catch {}

    // If pendo has already been initialized, update visitor/account metadata
    if (this.pendoInstance.isReady()) {
      this.pendoInstance.identify(opts);
    } else {
      try {
        await this.initPendoAsync(opts);
      } catch {
        console.error('Pendo failed to initialize');
        return;
      }
    }

    // this.pendoInstance.startGuides();

    // try {
    //   // Since these are undocumented APIs, wrap them in a try-catch.
    //   if (this.pendoInstance.areGuidesDisabled()) {this.pendoInstance.setGuidesDisabled(false);}
    // } catch {}
  }

  /** Since Pendo init is actually async, but they don't expose it as a promise
   * we wrap the callback to make it a nice, awaitable promise
   */
  private initPendoAsync(opts: pendo.InitOptions) {
    return new Promise<void>((resolve, reject) => {
      this.pendoInstance.initialize({
        ...opts,
        events: { ready: () => resolve() },
      });

      // If the call takes over a second, just forget it
      setTimeout(reject, 1000);
    });
  }

  // async pause() {
  //   if (!this.pendoInstance) {
  //     return;
  //   }

  //   try {
  //     await this.pendoInstance.flushNow();
  //   } catch {
  //     console.error('Pendo failed to flush tracked events');
  //   }

  //   this.pendoInstance.stopGuides();

  //   try {
  //     // Since these are undocumented APIs, wrap them in a try-catch.
  //     this.pendoInstance.setGuidesDisabled(true); // Prevent network calls to retrieve guide-related data.
  //     this.pendoInstance.stopSendingEvents();
  //   } catch {}
  // }

  // track(event: AnalyticEvent) {
  //   if (!this.pendoInstance) {
  //     return;
  //   }

  //   // https://developers.pendo.io/docs/?bash#track-events
  //   this.pendoInstance.track(event.name, event.properties);
  // }

  // clearSession() {
  //   if (!this.pendoInstance) {
  //     return;
  //   }

  //   this.pendoInstance.clearSession();
  // }
}

const downloadPendo = async (): Promise<pendo.Pendo> => {
  // sample-awareness: Replace the API key with your own.
  const pendoSnippet = `
    (function(apiKey){
      (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
        v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
          o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
          y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
          z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
    })('YOUR-API-KEY-HERE');
  `;

  // eslint-disable-next-line no-eval
  eval(pendoSnippet);

  return new Promise((resolve) => {
    let x = 0;
    // Wait until the pendo script has loaded
    // (5s max), then return the window.pendo object
    const intervalId = setInterval(() => {
      if ((window as any).pendo && typeof (window as any).pendo.isReady === 'function') {
        clearInterval(intervalId);
        resolve((window as any).pendo);
      } else if (++x >= 10) {
        clearInterval(intervalId);
        resolve(null);
      }
    }, 500);
  });
};

// export interface AnalyticEvent {
//   name: string;
//   properties?: { [key: string]: any };
// }
