import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase/app';
import { GooglePlus } from '@ionic-native/google-plus';
import { Observable } from "rxjs/Observable";
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook'
import { Firebase } from '@ionic-native/firebase';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class AuthProvider {

  constructor(public afAuth: AngularFireAuth, private googlePlus: GooglePlus, private platform: Platform, private facebook: Facebook, private firebase: Firebase, public angularfire: AngularFireDatabase) { }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<any> {
    return this.afAuth.auth.signOut();
  }

  signupUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword);
  }

 facebookLogin() {   
    return new Promise(resolve => {
      this.facebook.login(['email'])
    .then( response => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);

      firebase.auth().signInWithCredential(facebookCredential)
        .then( success => {            
          alert("Firebase success: " + JSON.stringify(success));           
           resolve(success)          
        });

    }).catch((error) => { alert(JSON.stringify(error)) })
    })
 }

  phoneLogin(phoneNumber) {
    return new Promise(resolve => {
      const phoneNumberString = "+91" + phoneNumber;
      if (this.platform.is('android')) {
        (<any>window).FirebasePlugin.verifyPhoneNumber(phoneNumberString, 60, (credential) => {
          var verificationId = credential.verificationId;
          resolve(credential.verificationId)
        }, error => {
          resolve(error)
        });
      } else {
        (<any>window).FirebasePlugin.getVerificationID(phoneNumberString, credential => {
          resolve(credential)
        }, error => {
          console.log(JSON.stringify(error));
          resolve(error)
        });
      }
    })
  }
  phoneWebLogin(recaptchaVerifier, phoneNumber) {
    return new Promise(resolve => {
      // this.loadingProvider.show();
      const phoneNumberString = "+91" + phoneNumber;
      firebase.auth().signInWithPhoneNumber(phoneNumberString, recaptchaVerifier)
        .then(credential => {
          // this.loadingProvider.hide();
          resolve(credential.verificationId);
        }).catch(error => {
          console.log(error);
        });
    })
  }

  SigninAfterMessageAuth(verificationId, confirmationCode) {
    return new Promise(resolve => {
      let signInCredential = firebase.auth.PhoneAuthProvider.credential(verificationId, confirmationCode);
      firebase.auth().signInWithCredential(signInCredential)
        .then(credentialData => {
          this.createUserData();
          resolve(credentialData);
        })
        .catch((error) => {
          alert("some err =>" + error);
        });
    })
  }
  


  loginWithFacebook() {
    return Observable.create(observer => {
      if (this.platform.is('cordova')) {
        return this.facebook.login(['email', 'public_profile']).then(res => {
          const facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(res.authResponse.accessToken);

          //const facebookCredential = auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
          firebase.auth().signInWithCredential(facebookCredential)
            .then((success) => {
              observer.next();
            }).catch(error => {
              //console.log(error);
              observer.error(error);
            });
        });
      }
    });
  }

  createUserData() {
    firebase.database().ref('accounts/' + firebase.auth().currentUser.uid).once('value')
      .then((account) => {
        // No database data yet, create user data on database
        if (!account.val()) {

          let user = firebase.auth().currentUser;
          let userId, provider, phoneNumber;
          let providerData = user.providerData[0];
          userId = user.uid;

          // Get provider from Firebase user.
          if (providerData.providerId == 'password') {
            provider = "Firebase";
          }
          else {
            provider = providerData.providerId;
          }

          // Get email from Firebase user.
          phoneNumber = user.phoneNumber;

          // Insert data on our database using AngularFire.
          this.angularfire.object('/accounts/' + userId).set({
            userId: userId,
            provider: provider,
            userType: "phoneNumber",
            phoneNumber: phoneNumber,
            dateCreated: new Date().toString()
          }).then(() => {
          }).catch(error => {
          });
        }
        if (firebase.auth().currentUser != null || firebase.auth().currentUser != undefined) {
          // update token

          // this.dataProvider.getAdminAccount().take(1).subscribe(adminAccount=>{
          this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({
            // friends: [adminAccount.uid],
            pushToken: localStorage.getItem('pushToken')
          });
        }
      });
  }


  addUserData(userData) {
    return new Promise(resolve => {
      let user = firebase.auth().currentUser;
      let userId,provider;
      let providerData = user.providerData[0];
      userId = user.uid;

      this.angularfire.list('/accounts/').push({
        userId: userId,
        provider : "Firebase",
        userType: "email",
        email: userData.email,
        password: userData.password
      }).then(() => {
        console.log("data")
        // this.dataProvider.sendInvitation(this.url1 + firebase.auth().currentUser.phoneNumber + this.url2 + "Welcome to Janvikalp" + this.url3).subscribe(data=>{
        // });
        // this.addInDefaultGroup().then(success=>{
        resolve('data');
        // });
      }), error => {
        alert("gir err =>" + error)
      };
    });
  }



}

