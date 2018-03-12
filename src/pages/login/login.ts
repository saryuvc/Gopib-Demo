import { Component } from '@angular/core';
import {
  NavController,IonicPage,
  LoadingController,
  Loading,
  AlertController,
  Platform
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';
import { GooglePlus } from '@ionic-native/google-plus';
import { ContactPage } from '../contact/contact';

import { HomePage } from '../home/home';
import { VerificationPage } from '../verification/verification';
import { LinkedIn } from '@ionic-native/linkedin';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook'
import firebase from 'firebase';
import { NativeStorage } from '@ionic-native/native-storage';
import { Validator } from '../../validator';
import { Firebase } from '@ionic-native/firebase';
import { SignupPage } from '../signup/signup';
import { ResetPasswordPage } from '../reset-password/reset-password';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public loginForm: FormGroup;
  public loading: Loading;
  userProfile: any = null;
  FB_APP_ID: number = 155347891862694;
  public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  private emailPasswordForm: FormGroup;
  private emailForm: FormGroup;

  scopes: any = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];

  isLoggedIn: boolean = false;
  selfData = { id: "", firstName: "", lastName: "" };


  constructor(public navCtrl: NavController, public authData: AuthProvider,
    public formBuilder: FormBuilder, public alertCtrl: AlertController, private firebase: Firebase,
    public loadingCtrl: LoadingController, private googlePlus: GooglePlus, private linkedin: LinkedIn, private platform: Platform, private facebook: Facebook, public nativeStorage: NativeStorage) {

    // this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

    this.facebook.browserInit(this.FB_APP_ID, "v2.8");
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
    this.emailPasswordForm = formBuilder.group({
      phoneNumber: Validator.phoneNumberValidator
    });
  }


  logout() {
    this.linkedin.logout();
    this.isLoggedIn = false;
  }
  // loginwithgoogle() {
  //   this.googlePlus.login({})
  //     .then(res => {
  //       this.navCtrl.push(HomePage);
  //     }).catch(err => alert("err is " + err));
  // }

  loginwithgoogle(): void {
    this.googlePlus.login({
      //'scopes': 'profile',
      'webClientId': '925682647131-u6nm102q7in5v6d5gnb6lobn9sl3l3f5.apps.googleusercontent.com',
       'offline': true
    }).then(res => {
      alert('helo ' + JSON.stringify(res))
      firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
        .then(success => {
          alert("Firebase success: " + JSON.stringify(success));
          this.navCtrl.push(HomePage);
        })
        .catch(error => alert("Firebase failure: " + JSON.stringify(error)));
    }).catch(err => alert("Error: " + err));
  }


  ionViewWillEnter() {
  //  this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
  }


    facebookLogin(){
       this.facebook.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => 
        alert('Logged into Facebook!'+JSON.stringify(res))
      ).catch(e => console.log('Error logging into Facebook'+JSON.stringify(e)));


    this.facebook.logEvent(this.facebook.EVENTS.EVENT_NAME_ADDED_TO_CART);
  
      // this.authData.facebookLogin().then((data)=>{
      //   alert("hi im loged in")
     
      //   alert("hi data is"+   data)
      // }).catch((error) => { alert("error is there"+error) });
    }


  getSelfData() {
    this.linkedin.getRequest('people/~')
      .then(res => {
        alert("res " + JSON.stringify(res))
        this.selfData = res;
        this.navCtrl.push(HomePage);
      })
      .catch(e => alert(e));
  }

  ionViewDidAppear() {
    this.linkedin.hasActiveSession().then((active) => {
      this.isLoggedIn = active;
      if (this.isLoggedIn === true) {
        this.getSelfData();
      }
    }).catch((error) => {
      alert("failure: " + JSON.stringify(error));
    });
  }

  loginwithlinkedIn() {
    this.linkedin.login(this.scopes, true)
      .then(() => {
        this.isLoggedIn = true;
        this.getSelfData();
      })
      .catch(e => alert('Error logging in' + e));
  }

  loginUser() {
    if (!this.loginForm.valid) {
      console.log(this.loginForm.value);
    } else {
      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
        .then(authData => {
          this.navCtrl.setRoot(ContactPage);
        }, error => {
          this.loading.dismiss().then(() => {
            let alert = this.alertCtrl.create({
              message: error.message,
              buttons: [
                {
                  text: "Ok",
                  role: 'cancel'
                }
              ]
            });
            alert.present();
          });
        });

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  goToResetPassword() {
    this.navCtrl.push(ResetPasswordPage);
  }

  createAccount() {
    this.navCtrl.push(SignupPage);
  }

  signIn() {
    if (this.platform.is('cordova')) {
      //   alert('here' + this.emailPasswordForm.value["phoneNumber"])
      //   let number = "+91" + this.emailPasswordForm.value["phoneNumber"];
      //   alert('here' + number);
      //   alert("(<any>window).FirebasePlugin =" + JSON.stringify((<any>window).FirebasePlugin));
      //   //this.platform.ready().then(()=>{
      //   (<any>window).FirebasePlugin.verifyPhoneNumber(number, 120, (credential) => {
      //     alert(credential);
      //     var verificationId = credential.verificationId;
      //     this.navCtrl.push(VerificationPage, { verificationId: verificationId, phoneNumber: this.emailPasswordForm.value["phoneNumber"] }); //This is STEP 3 - passing verification ID to OTP Page
      //   }, (error) => {
      //     //this.eer = error;
      //     alert('Failed to send OTP. Try again');
      //     console.error(error);
      //   });
      //   // })
      // }
      this.authData.phoneLogin(this.emailPasswordForm.value["phoneNumber"]).then(verificationId => {
        this.navCtrl.push(VerificationPage, { verificationId: verificationId, phoneNumber: this.emailPasswordForm.value["phoneNumber"] });
      });
    } else if (this.platform.is('mobileweb') || this.platform.is('core')) {
      this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
      this.authData.phoneWebLogin(this.recaptchaVerifier, this.emailPasswordForm.value["phoneNumber"]).then(verificationId => {
        this.navCtrl.push(VerificationPage, { verificationId: verificationId, phoneNumber: this.emailPasswordForm.value["phoneNumber"] });
      });
    }
  }

}
