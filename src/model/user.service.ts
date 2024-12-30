/* import { Injectable } from '@nestjs/common';
import { User } from './user.entity'; // Make sure User entity is defined correctly
import { dynamoDBClient } from 'src/config/database-config.service';
import { v4 as uuidv4 } from 'uuid';

const { USERS_TABLE } = process.env;

@Injectable()
export class UserService {
  async createUser(
    mobileNumber: string,
    language: string,
    botID: string,
  ): Promise<User | null> {
    try {
      // Check if the user already exists
      let user = await this.findUserByMobileNumber(mobileNumber, botID);

      if (user) {
        // If user exists, update their information
        const updateUser = {
          TableName: USERS_TABLE,
          Item: user,
        };
        await dynamoDBClient().put(updateUser).promise();
        return user; // Return the updated user
      } else {
        // If user does not exist, create a new user
        const newUser = {
          mobileNumber: mobileNumber,
          language: language,
          Botid: botID,
          id: uuidv4(), // Generate a unique ID for the user
        };

        const createUserParams = {
          TableName: USERS_TABLE,
          Item: newUser,
        };
        await dynamoDBClient().put(createUserParams).promise();
        return newUser; // Return the new user
      }
    } catch (error) {
      console.error('Error in createUser:', error);
      return null; // Return null on error
    }
  }

  async findUserByMobileNumber(mobileNumber: string, Botid: string): Promise<User | null> {
    try {
      const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: 'mobileNumber = :mobileNumber and Botid = :Botid',
        ExpressionAttributeValues: {
          ':mobileNumber': mobileNumber,
          ':Botid': Botid,
        },
      };
      const result = await dynamoDBClient().query(params).promise();

      // Return a User object or null
      if (result.Items && result.Items.length > 0) {
        const userData = result.Items[0];
        return {
          mobileNumber: userData.mobileNumber,
          language: userData.language,
          Botid: userData.Botid,
          id: userData.id, // Include ID if needed
        } as User; // Type assertion to User
      }
      return null; // Return null if no user found
    } catch (error) {
      console.error('Error querying user from DynamoDB:', error);
      return null; // Return null on error
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const updateUser = {
        TableName: USERS_TABLE,
        Item: {
          mobileNumber: user.mobileNumber,
          language: user.language,
          Botid: user.Botid,
         // id: user.id, // Ensure you're including the ID if necessary
        },
      };
      await dynamoDBClient().put(updateUser).promise(); // Save the user
    } catch (error) {
      console.error('Error saving user to DynamoDB:', error);
    }
  }

  async deleteUser(mobileNumber: string, Botid: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
      };
      await dynamoDBClient().delete(params).promise();
      console.log(
        `User with mobileNumber ${mobileNumber} and Botid ${Botid} deleted successfully.`,
      );
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
    }
  }
} */

 /*  import { Injectable } from '@nestjs/common';
import { User } from './user.entity';  // Ensure User entity includes selectedState
import { dynamoDBClient } from 'src/config/database-config.service';
import { v4 as uuidv4 } from 'uuid';

const { USERS_TABLE } = process.env;

@Injectable()
export class UserService {
  // In UserService
async createUser(mobileNumber: string, language: string, botID: string, selectedState: string): Promise<User | null> {
  try {
    let user = await this.findUserByMobileNumber(mobileNumber, botID);

    if (user) {
      // Update the user with the selected state
      //user.selectedState = selectedState;
      user.selectedState = selectedState;
      await this.saveUser(user); // Save the updated user
      return user; // Return updated user
    } else {
      // Create new user if not found
      const newUser = {
        mobileNumber,
        language,
        Botid: botID,
        id: uuidv4(), // Unique ID
        selectedState, // Save the selected state
        buttonClickCount,
      };

      await this.saveUser(newUser); // Save new user
      return newUser;
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    return null;
  }
}

// Save user method
async saveUser(user: User): Promise<void> {
  try {
    const createUserParams = {
      TableName: USERS_TABLE,
      Item: user, // Save the user with the selected state
    };
    await dynamoDBClient().put(createUserParams).promise(); // Store in the DB
  } catch (error) {
    console.error('Error saving user:', error);
  }
}


async findUserByMobileNumber(
  mobileNumber: string,
  Botid: string,
): Promise<User | null> {
  try {
    const params = {
      TableName: USERS_TABLE,
      KeyConditionExpression: 'mobileNumber = :mobileNumber and Botid = :Botid',
      ExpressionAttributeValues: {
        ':mobileNumber': mobileNumber,
        ':Botid': Botid,
      },
    };
    const result = await dynamoDBClient().query(params).promise();

    if (result.Items && result.Items.length > 0) {
      const user = result.Items[0];
      return {
        mobileNumber: user.mobileNumber,
        language: user.language,
        Botid: user.Botid,
        id: user.id,
        selectedState: user.selectedState, // Include selectedState
        buttonClickCount: user.buttonClickCount || 0,
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error querying user from DynamoDB:', error);
    return null;
  }
}


  

  async deleteUser(mobileNumber: string, Botid: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
      };
      await dynamoDBClient().delete(params).promise();
      console.log(
        `User with mobileNumber ${mobileNumber} and Botid ${Botid} deleted successfully.`,
      );
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
    }
  }
}
 */
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';  // Ensure User entity includes selectedState
import { dynamoDBClient } from 'src/config/database-config.service';
import { v4 as uuidv4 } from 'uuid';

const { USERS_TABLE } = process.env;

@Injectable()
export class UserService {
  // In UserService
  async createUser(mobileNumber: string,YearButtonCount: number, language: string, botID: string, selectedState: string, selectedYear: number=0, buttonClickCount: number = 0, feedback: string = '', previousButtonMessage: string = '', previousButtonMessage1: string = ''): Promise<User | null> {
    try {
      let user = await this.findUserByMobileNumber(mobileNumber, botID);

      if (user) {
        // Update the user with the selected state
        user.previousButtonMessage = previousButtonMessage;
        user.previousButtonMessage1 = previousButtonMessage1;
        user.feedback = feedback;
        user.YearButtonCount = YearButtonCount;
        user.selectedState = selectedState;
        user.selectedYear = selectedYear; // save the selectedYear
        user.buttonClickCount = buttonClickCount; // Make sure buttonClickCount is updated
        await this.saveUser(user); // Save the updated user
        return user; // Return updated user
      } else {
        // Create new user if not found
        const newUser = {
          mobileNumber,
          language,
          Botid: botID,
          id: uuidv4(), // Unique ID
          selectedState, // Save the selected state
          selectedYear, //save selected year
          buttonClickCount,
          YearButtonCount,
          feedback,
          previousButtonMessage,
          previousButtonMessage1,
        };

        await this.saveUser(newUser); // Save new user
        return newUser;
      }
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  // Save user method
  async saveUser(user: User): Promise<void> {
    try {
      const createUserParams = {
        TableName: USERS_TABLE,
        Item: user, // Save the user with the selected state
      };
      await dynamoDBClient().put(createUserParams).promise(); // Store in the DB
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async findUserByMobileNumber(
    mobileNumber: string,
    Botid: string,
  ): Promise<User | null> {
    try {
      const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: 'mobileNumber = :mobileNumber and Botid = :Botid',
        ExpressionAttributeValues: {
          ':mobileNumber': mobileNumber,
          ':Botid': Botid,
        },
      };
      const result = await dynamoDBClient().query(params).promise();

      if (result.Items && result.Items.length > 0) {
        const user = result.Items[0];
        return {
          mobileNumber: user.mobileNumber,
          language: user.language,
          Botid: user.Botid,
          id: user.id,
          YearButtonCount:user.YearButtonCount,
          selectedYear: user.selectedYear || 0, // include selectedYear
          selectedState: user.selectedState, // Include selectedState
          buttonClickCount: user.buttonClickCount || 0,
          feedback: user.feedback || '',
          previousButtonMessage: user.previousButtonMessage || '',
          previousButtonMessage1: user.previousButtonMessage1 || '',
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error querying user from DynamoDB:', error);
      return null;
    }
  }

  async deleteUser(mobileNumber: string, Botid: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
      };
      await dynamoDBClient().delete(params).promise();
      console.log(
        `User with mobileNumber ${mobileNumber} and Botid ${Botid} deleted successfully.`,
      );
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
    }
  }
}
