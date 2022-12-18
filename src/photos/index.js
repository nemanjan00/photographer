const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const crypto = require("crypto");

const ExifImage = require("exif").ExifImage;

const YAML = require("yaml");

module.exports = (photosPath) => {
	const meta = YAML.parse(fs.readFileSync(path.join(photosPath, "photos.yml")) + "");

	const photosPromise = meta.photos.map(photo => {
		return new Promise((resolve, reject) => {
			fs.readFile(path.join(photosPath, photo.path), (error, photoData) => {
				if(error) {
					console.error(error);

					return resolve(photo);
				}

				const hash = crypto.createHash("sha256").update(photoData).digest("hex");

				photo.hash = hash;
				photo.path = `${path.join("photos", photo.path)}?photo_hash=${hash}`;

				const promises = [
					sharp(photoData)
						.resize(9, 9)
						.jpeg({ mozjpeg: true })
						.toBuffer()
						.then( data => {
							photo.thumbnail = `data:image/jpeg;base64, ${data.toString("base64")}`;
						})
						.catch( err => {
							console.error(err);
						}),
					new Promise((resolve) => {
						new ExifImage({image: photoData}, (error, exifData) => {
							if(error) {
								console.error(error);

								photo.exif = {};

								return resolve();
							}

							photo.exif = exifData;

							resolve();
						});
					})
				];

				return Promise.all(promises).then(() => {
					return resolve(photo);
				});
			});
		});
	});

	return Promise.all(photosPromise).then(photos => {
		meta.photos = photos;

		console.log(JSON.stringify(meta, null, 4));

		return meta;
	});
};
