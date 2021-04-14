const express = require("express");
const { MongoClient } = require("mongodb");

const bodyParser = require("body-parser");
const app = express();

const uri = "mongodb+srv://Ricksaw:CSGObotti123@ricksaw.w550y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const PORT = 3000;
client.connect();


app.post("/api/data", async (req, res) => {
	if (!req.body.command) {
		return res.status(400).json({
			status: "error",
			error: "req body can't be empty",
		});
	}
	async function commandRan(command) {
		// try {
		// await client.connect();
		// const options = { upsert : true };
		const database = client.db("DiscordData");
		const collection = database.collection("discord");
		if (command === "stats") {
			const query = { "statsUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "statsUsedCount": 1 } },
			);
		}
		else if (command === "profile") {
			const query = { "profileUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "profileUsedCount": 1 } },
			);
		}
	}
	// finally {await client.close();}
	// }
	commandRan(req.body.command).catch(console.dir);
	res.send("OK!");
});

process.on("SIGINT", function() {
	client.close(function() {
		console.log("Mongoose disconnected on app termination");
		process.exit(0);
	});
});

app.listen(PORT, () => {
	console.log(`App listening at .${PORT}`);
});