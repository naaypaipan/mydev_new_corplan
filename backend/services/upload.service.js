const { gcsBucket } = require("../configs/app");
const { ErrorBadRequest } = require("../configs/errorMethods");
const gcs = require("../configs/gcs");
const { CreatedStatus } = require("../constants");

let gcsBucketReadyPromise = null;
function ensureGcsBucket() {
  if (!gcsBucketReadyPromise) {
    gcsBucketReadyPromise = (async () => {
      const [bucketExist] = await gcs.bucket(gcsBucket).exists();
      if (!bucketExist) {
        await gcs.createBucket(gcsBucket);
      }
    })();
  }
  return gcsBucketReadyPromise;
}

const defaultMimeType = "image/png";
const endpoint = "https://storage.googleapis.com";
const re = /(?:\.([^.]+))?$/;

const methods = {
  base64MimeType(encoded) {
    let result = null;

    if (typeof encoded !== "string") {
      return result;
    }

    const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) {
      result = mime[1];
    }

    return result;
  },

  getExtension(fileName) {
    const ext = re.exec(fileName)[1];
    if (ext) {
      return ext;
    }
    return "";
  },

  getFileName() {
    return new Date().valueOf().toString();
  },

  getPath(imageType) {
    const imageTypeStr = String(imageType).toLowerCase();
    switch (imageTypeStr) {
      case "products":
        return "products/";
      case "profiles":
        return "profiles/";
      default:
        return "others/";
    }
  },

  uploadFile(req) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(req.file);
        const {
          // fieldname,
          originalname,
          // encoding,
          mimetype,
          // size,
          buffer,
        } = req.file;
        await ensureGcsBucket();

        const folderType = "files/";
        const filePath = String(
          `${folderType}${this.getFileName()}.${this.getExtension(
            originalname
          )}`
        );

        const file = gcs.bucket(gcsBucket).file(filePath);

        const fileOptions = {
          resumable: false,
          metadata: {
            contentType: mimetype,
          },
          validation: false,
        };

        await file.save(buffer, fileOptions);
        await file.makePublic();

        resolve({
          status: CreatedStatus,
          url: `${endpoint}/${gcsBucket}/${filePath}`,
        });
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
  upload(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const { imageType, image, alt } = data;

        // Detect extension from base64 mime type instead of hardcoding .png
        const mimeType = this.base64MimeType(image) || defaultMimeType;
        let extension = "png";
        if (mimeType === "application/pdf") extension = "pdf";
        else if (mimeType === "image/jpeg") extension = "jpg";
        else if (mimeType === "image/png") extension = "png";
        else if (mimeType === "image/gif") extension = "gif";
        else if (mimeType === "image/webp") extension = "webp";
        else {
          const parts = mimeType.split("/");
          if (parts.length === 2) extension = parts[1];
        }

        const filePath = String(this.getPath(imageType));
        const fileName = String(
          `${filePath}${this.getFileName()}.${extension}`
        );

        await ensureGcsBucket();

        const file = gcs.bucket(gcsBucket).file(fileName);

        const fileOptions = {
          resumable: false,
          metadata: {
            contentType: mimeType,
          },
          validation: false,
        };

        const base64EncodedString = image?.replace(
          /^data:[a-zA-Z0-9+/.-]+;base64,/,
          ""
        );

        const fileBuffer = Buffer.from(base64EncodedString, "base64");
        await file.save(fileBuffer, fileOptions);
        await file.makePublic();

        resolve({
          status: CreatedStatus,
          image_type: imageType,
          url: `${endpoint}/${gcsBucket}/${fileName}`,
          alt,
        });
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
  uploadBase64(data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { image } = data; // const image = data.image

        const fileOptions = {
          resumable: false,
          metadata: {
            contentType: this.base64MimeType(image) || defaultMimeType,
          },
          validation: false,
        };

        const base64EncodedString = image.replace(/^data:\w+\/\w+;base64,/, "");
        await ensureGcsBucket();
        const fileBuffer = Buffer.from(base64EncodedString, "base64");
        const extension = "png";
        // const filePath = String(this.getPath(imageType));
        const fileName = String(`${this.getFileName()}.${extension}`);

        const file = gcs.bucket(gcsBucket).file(fileName);

        await file.save(fileBuffer, fileOptions);
        await file.makePublic();

        // const resizedStorageRef = bucket.file(fileNameResize);

        // // eslint-disable-next-line no-magic-numbers
        // await this.keepTrying(10, resizedStorageRef);

        resolve({
          status: CreatedStatus,
          name: `${fileName}.${extension}`,
          url: `${endpoint}/${gcsBucket}/${fileName}`,
        });
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
