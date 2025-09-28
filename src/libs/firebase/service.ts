import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  UpdateData,
  updateDoc,
  where,
} from "firebase/firestore";
import app from "./init";
import { EventInterface } from "@/app/components/interfaces/event";
import { QrCodeInterface } from "@/app/components/interfaces/qrCode";
import { PaymentStatusInterface } from "@/app/components/interfaces/paymentStatus";
import { LoginGooglePropsInterface } from "@/app/components/interfaces/loginGoogleProps";
import { db } from "./admin";

const firestore = getFirestore(app);

export async function retrieveData(collectionName: string) {
  const snapshot = await getDocs(collection(firestore, collectionName));
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
}

export async function retrieveDataById(collectionName: string, id: string) {
  const snapshot = await getDoc(doc(firestore, collectionName, id));
  const data = snapshot.data();
  return data;
}

export async function retrieveDataByField(
  collectionName: string,
  field: string,
  value: string
) {
  const q = query(
    collection(firestore, collectionName),
    where(field, "==", value)
  );
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return data;
}

// export async function retrieveDataQrCode(
//   collectionName: string,
//   value: string,
//   isQrCodeArray: boolean = false
// ) {
//   const q = db.collection(collectionName);
//   const snapshot = await q.get();

//   let data = snapshot.docs.map(
//     (doc) =>
//       ({
//         id: doc.id,
//         ...doc.data(),
//       } as QrCodeInterface)
//   );

//   if (isQrCodeArray) {
//     data = data.filter((item) =>
//       item.qr_code.some((obj: Record<string, string>) =>
//         Object.values(obj).includes(value)
//       )
//     );
//   }

//   return data;
// }

export async function addData(
  collectionName: string,
  data:
    | EventInterface
    | QrCodeInterface
    | PaymentStatusInterface
    | LoginGooglePropsInterface
) {
  try {
    await addDoc(collection(firestore, collectionName), data);
    return {
      status: true,
      statusCode: 200,
      message: "Data added successfully",
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { status: false, statusCode: 500, message: err.message };
    }
    return { status: false, statusCode: 500, message: "Update failed" };
  }
}

export async function updateData(
  collectionName: string,
  id: string,
  data: UpdateData<EventInterface | QrCodeInterface | PaymentStatusInterface>
) {
  try {
    await updateDoc(doc(firestore, collectionName, id), data);
    return {
      status: true,
      statusCode: 200,
      message: "Data updated successfully",
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { status: false, statusCode: 500, message: err.message };
    }
    return { status: false, statusCode: 500, message: "Update failed" };
  }
}

export async function deleteById(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(firestore, collectionName, id));
    return {
      status: true,
      statusCode: 200,
      message: "Data deleted successfully",
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        status: false,
        statusCode: 500,
        message: err.message,
      };
    }
    return {
      status: false,
      statusCode: 500,
      message: "Failed to delete data",
    };
  }
}

export async function loginWithGoogle(data: LoginGooglePropsInterface) {
  const user: LoginGooglePropsInterface[] = (await retrieveDataByFieldAdmin(
    "users",
    "email",
    data.email
  )) as LoginGooglePropsInterface[];
  if (user.length > 0) {
    data.role = user[0].role;
    data.name = user[0].name;
    return { status: true, user: data };
  } else {
    data.role = "user";
    const id = await db
      .collection("users")
      .add(data)
      .then((docRef) => {
        return docRef.id;
      });
    const user = { id, email: data.email, role: "user" };
    return { status: true, user };
  }
}

// admin ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export async function retrieveDataByFieldAdmin(
  collectionName: string,
  field: string,
  value: string
) {
  try {
    const snap = await db
      .collection(collectionName)
      .where(field, "==", value)
      .get();

    if (snap.empty) {
      return [];
    }

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to retrieve data: ${err.message}`);
    }
    throw new Error(`Failed to retrieve data`);
  }
}
