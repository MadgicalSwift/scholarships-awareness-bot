import { Injectable } from '@nestjs/common';
import { collection, doc, updateDoc, getDoc, getFirestore, CollectionReference, DocumentData } from "firebase/firestore"
import db from '../config/database-config.service'; // Firestore DB instance
import { User } from './user.entity';

@Injectable()
export class UserService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    this.collection = db.collection('users1'); // Firestore Admin SDK collection reference
  }

    async createUser(
    mobileNumber: string,
    yearButtonCount: number,
    pdfIndex: number,
    language: string,
    botID: string,
    selectedState: string,
    selectedYear: number = 0,
    seeMoreCount: number = 0,
    applyLinkCount: number = 0,
    feedback: { date: any; feedback: string }[] = [],
    previousButtonMessage: string = '',
    previousButtonMessage1: string = ''
  ): Promise<User | null> {
    try {
	    console.log("sdsads")
      const existingUserSnapshot = await this.collection
        .where('mobileNumber', '==', mobileNumber)
        .where('botID', '==', botID)
        .get();

      if (!existingUserSnapshot.empty) {
        const userDoc = existingUserSnapshot.docs[0];
        const user = userDoc.data() as User;

        const updatedUser = {
          ...user,
          previousButtonMessage,
          previousButtonMessage1,
          feedback,
          yearButtonCount,
          pdfIndex,
          selectedState,
          selectedYear,
          seeMoreCount,
          applyLinkCount,
        };

        await this.collection.doc(userDoc.id).update(updatedUser);
        return { id: userDoc.id, ...updatedUser };
      } else {
        const newUser: User = {
          mobileNumber,
          language,
          botID,
          selectedState,
          selectedYear,
          seeMoreCount,
          applyLinkCount,
          yearButtonCount,
          pdfIndex,
          feedback,
          previousButtonMessage,
          previousButtonMessage1,
        };

        const docRef = await this.collection.add(newUser);
        return { id: docRef.id, ...newUser };
      }
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  async findUserByMobileNumber(mobileNumber: string, botID: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('mobileNumber', '==', mobileNumber)
      .where('botID', '==', botID)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async saveUser(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required to update Firestore document');
    }

    const userDocRef = this.collection.doc(user.id); // Get reference to user document
    const updateData: Partial<User> = { ...user };
    delete updateData.id; // Firestore does not store ID as a field

    try {
      await userDocRef.set(updateData, { merge: true }); // Merge updates into Firestore

      const updatedUserDoc = await userDocRef.get();
      if (!updatedUserDoc.exists) {
        throw new Error(`User with ID ${user.id} not found after update`);
      }

      return { ...updatedUserDoc.data(), id: user.id } as User; // Return updated user data
    } catch (error) {
      console.error("Error updating user in Firestore:", error);
      throw new Error('Failed to update user in Firestore');
    }
  }
    
}
