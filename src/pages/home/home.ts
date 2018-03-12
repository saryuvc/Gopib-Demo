import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import { ContactPage } from '../contact/contact';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LoginPage } from '../login/login';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private userDetailId: any;
  constructor(public navCtrl: NavController, public authData: AuthProvider, private contacts: Contacts, private sms: SMS,
    private socialSharing: SocialSharing,public angularfire: AngularFirestore) {
 
    
  }
  signOut() {
    this.authData.logoutUser()
      .then(() => {
        this.navCtrl.setRoot(LoginPage);
      });
  }
  importContacts() {
    this.navCtrl.push(ContactPage);
  }
  inviteFriends() {

 
  }

  getPhoneBook(userDetailId) {
    return this.angularfire.collection('/phoneBook/').doc(userDetailId).collection('contacts');
  }
}
