const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");
const { storage } = require("../configs/firebase.config");

const saveToStorage = async (file, folder) => {
  try {
    const ext = file[0].mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const metadata = { contentType: file[0].mimetype };
    const snapshot = await uploadBytes(storageRef, file[0].buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      downloadURL,
      fullPath: storageRef.fullPath,
    };
  } catch (e) {
    throw {
      statusCode: 500,
      message: "Failed to upload to Firebase",
      error: e.message,
    };
  }
};

const deleteFromStorage = async (paths) => {
  try {
    const fileRefs = paths.map((path) => ref(storage, path));
    await Promise.all(fileRefs.map((fileRef) => deleteObject(fileRef)));
    return;
  } catch (e) {
    throw {
      statusCode: 500,
      message: "Failed to delete from Firebase",
      error: e.message,
    };
  }
};

module.exports = { saveToStorage, deleteFromStorage };
