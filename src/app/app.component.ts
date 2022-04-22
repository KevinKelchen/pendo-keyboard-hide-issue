import { Component } from '@angular/core';
// import { Keyboard } from '@capacitor/keyboard'; // sample-awareness: Comment-in if showing the keyboard accessory bar.
import { Platform } from '@ionic/angular';

import { PendoService } from './pendo.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private pendoService: PendoService, private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    // sample-awareness: Comment-in if showing the keyboard accessory bar.
    // Making the keyboard accessory bar visible as it is
    // within in our app is not necessary to reproduce the issue,
    // but including it here as a switch for quick testing.
    // await this.setKeyboardAccessoryBarVisible(true);

    await this.pendoService.init();
  }

  // sample-awareness: Comment-in if showing the keyboard accessory bar.
  // setKeyboardAccessoryBarVisible(isVisible: boolean): Promise<void> {
  //   if (!(this.platform.is('hybrid') && this.platform.is('ios'))) {return Promise.resolve();}

  //   return Keyboard.setAccessoryBarVisible({ isVisible });
  // }
}
