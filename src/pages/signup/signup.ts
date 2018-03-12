import { Component } from '@angular/core';
import {
  NavController,
  LoadingController,
  Loading,
  AlertController
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { HomePage } from '../home/home';
import { ContactPage } from '../contact/contact';

import { EmailValidator } from '../../validators/email';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  public signupForm: FormGroup;
  public loading: Loading;

  constructor(public nav: NavController, public authData: AuthProvider,
    public formBuilder: FormBuilder, public loadingCtrl: LoadingController,public angularfire: AngularFirestore,
    public alertCtrl: AlertController) {

    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],      
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }


  signupUser() {
    if (!this.signupForm.valid) {
      console.log(this.signupForm.value);
    } else {
      let inputparam = {
        email: this.signupForm.value.email,
     //   recovery_email: this.signupForm.value.remail,
        password: this.signupForm.value.password
      };
          this.authData.signupUser(this.signupForm.value.email, this.signupForm.value.password)
            .then(() => {
              this.authData.addUserData(inputparam).then(data => {
                 this.nav.setRoot(ContactPage);
              });             
              
            }, (error) => {
              this.loading.dismiss().then(() => {
                var errorMessage: string = error.message;
                let alert = this.alertCtrl.create({
                  message: errorMessage,
                  buttons: [
                    {
                      text: "Ok",
                      role: 'cancel'
                    }
                  ]
                });
                alert.present();
              });
            // });
      });
      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }
}