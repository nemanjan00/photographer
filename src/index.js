const path = require("path");
const fs = require("fs");

const Mustache = require("mustache");

const photos = require("./photos")(path.join(__dirname, "../photos"));

const html = fs.readFileSync(path.join(__dirname, "../public/index.html")) + "";

const cache = {};

const renderHtml = () => {
	if(cache["html"]) {
		return Promise.resolve(cache["html"]);
	}

	return photos.then(photos => {
		return cache["html"] = Mustache.render(html, {
			json: JSON.stringify(photos),
			photos: photos
		});
	});
};

const fastify = require("fastify")({
	logger: true
});

fastify.register(require("@fastify/static"), {
	root: path.join(__dirname, "../photos"),
	prefix: "/photos/"
});

fastify.get("/sw.js", function (_req, reply) {
	reply.sendFile("sw.js", );
});

fastify.get("/*", function (_req, reply) {
	renderHtml().then(html => {
		reply.headers({
			"Content-Type": "text/html"
		});

		reply.send(html);
	});
});

const port = process.env.PORT || 3000;

fastify.listen({ port }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	console.log(`Server is now listening on ${address}`);
});
