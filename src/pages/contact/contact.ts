import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {
  private invitelistToShow: any;
  private selectedContacts:any = [];
  private selectedAll:boolean = false;
 
  constructor(public navCtrl: NavController, public navParams: NavParams,  public authData: AuthProvider,private contacts: Contacts, public angularfire: AngularFirestore,
    private sms: SMS, private socialSharing: SocialSharing) {   
    this.invitelistToShow = this.navParams.get('allContacts');
    this.contacts.find(['displayName', 'name', 'phoneNumbers', 'emails'], { filter: "", multiple: true })
      .then(data => {
        localStorage.setItem('phoneBook', JSON.stringify(this.invitelistToShow));
        this.invitelistToShow = data;
        this.saveUserDetailtoDb();
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactPage');
  }

  saveUserDetailtoDb() {
    this.angularfire.collection('/accounts/').doc(firebase.auth().currentUser.uid).ref.get()
      .then((doc) => {
        // No database data yet, create user data on database
        if (!doc.exists) {
          let user = firebase.auth().currentUser;
          let userId, provider, img, phoneNumber;
          let providerData = user.providerData[0];
          userId = user.uid;

          // Get provider from Firebase user.
          if (providerData.providerId == 'password') {
            provider = "Firebase";
          }
          else {
            provider = providerData.providerId;
          }
          img = "assets/images/profile.png";

          // Get email from Firebase user.
          phoneNumber = "9558109184";

          // Insert data on our database using AngularFire.
          this.angularfire.collection('/accounts/').doc(userId).set({
            userId: userId,
            provider: provider,
            img: img,
            country: "india",
            FirstName: "Any",
            lastName: 'User',
            appStatus: "Welcome To Gopib!",
            userType: 1,
            phoneNumber: phoneNumber,
            emailStatus: false,
            dateCreated: new Date()
          }).then(() => {
            this.angularfire.collection('/accounts/' + userId + '/phoneBook/').add(this.invitelistToShow).then((success: any) => {
              alert("sucess")
            });
          }).catch(error => {
            alert("Firebase failure: " + JSON.stringify(error));
          });
        } else {
          alert("else")

          let user = firebase.auth().currentUser;
          let userId, provider, img, phoneNumber;
          let providerData = user.providerData[0];
          userId = user.uid;
          if (this.invitelistToShow) {
            alert('hekkkk')
            this.angularfire.collection('/accounts/' + user.uid + '/phoneBook/').add(this.invitelistToShow).then((success: any) => {
              alert("sucess")
            });
          }
        }

      });
  }

  getPhoneBook(userId) {
    return this.angularfire.collection('/accounts/' + userId + '/phoneBook/').valueChanges();
  }

  onChange(number, isChecked) {
    if (isChecked) {
      if (this.selectedContacts.indexOf(number) == -1) {
        this.selectedContacts.push(number);
      }
    } else {
      let idx = this.selectedContacts.findIndex(x => x == number);
      this.selectedContacts.splice(idx, 1);
    }
  }

  signOut() {
    this.authData.logoutUser()
      .then(() => {
        this.navCtrl.setRoot(LoginPage);
      });
  }

}
