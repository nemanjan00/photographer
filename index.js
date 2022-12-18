const path = require("path");

const fastify = require("fastify")({
	logger: true
});

fastify.register(require("@fastify/static"), {
	root: path.join(__dirname, "public"),
	prefix: "/public/"
});

fastify.get("/sw.js", function (req, reply) {
	reply.sendFile("sw.js");
});

fastify.get("/*", function (req, reply) {
	reply.sendFile("index.html");
});

const port = process.env.PORT || 3000;

fastify.listen({ port }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	console.log(`Server is now listening on ${address}`);
});
