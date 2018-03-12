import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App, Platform } from 'ionic-angular';
import * as firebase from 'firebase';
import { FormBuilder } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { HomePage } from '../home/home';
import { Validator } from '../../validator';
import {Firebase} from '@ionic-native/firebase';


@Component({
  selector: 'page-verification',
  templateUrl: 'verification.html'
})
export class VerificationPage {
  // VerificationPage
  // This is the page where the user is redirected when their email needs confirmation.
  // A verification check interval is set to check every second, if the user has confirmed their email address.
  // When an account is confirmed the user is then directed to homePage.
  private user: any;
  private alert;
  private verificationId;
  private confirmationResult;
  private phoneNumber;
  private recaptchaVerifier;
  private verificationForm;
  private resendDisabled;
  private resendTimerInterval;
  private resendTimer;
  private sendTimer;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams,
    public app: App, private platform: Platform, public formBuilder: FormBuilder,public authData: AuthProvider, private firebase: Firebase) {
       this.verificationForm = formBuilder.group({
      confirmCode: Validator.requiredValidator
    });
    this.sendTimer = new Date();
    this.verificationId = this.navParams.get('verificationId');   
    this.phoneNumber = this.navParams.get('phoneNumber');
  }

  ionViewDidLoad() {
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    }
  }

  register() {
    this.authData.SigninAfterMessageAuth(this.verificationId, this.verificationForm.value['confirmCode']).then(data => {
      this.navCtrl.setRoot(HomePage);
    });
  }

  sendPhoneVerification() {
    if (this.platform.is('cordova')) {
      this.authData.phoneLogin(this.phoneNumber).then(verificationId => {
        this.verificationId = verificationId;
        this.sendTimer = new Date();
        this.resendDisabled = true;
      });
    }
    else if (this.platform.is('mobileweb') || this.platform.is('core')) {
      this.authData.phoneWebLogin(this.recaptchaVerifier, this.phoneNumber).then(verificationId => {
        this.verificationId = verificationId;
        this.sendTimer = new Date();
        this.resendDisabled = true;
      });
    }
  }

  setPhoneNumberAgain() {
    this.navCtrl.pop();
  }
}
