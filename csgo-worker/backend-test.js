// const MongoClient = require("mongodb").MongoClient;
// const uri = "mongodb+srv://Ricksaw:CSGObotti123@ricksaw.w550y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const rp = require("request-promise");

// async function run() {
// 	try {
// 		await client.connect();

// 		const database = client.db("DiscordData");
// 		const discordCollection = database.collection("Discord");
// 		// Document Below
// 		const value = { userID: "1010010100101001", channelID: "1337" };
// 		const push = await discordCollection.insertOne(value);


// 		console.log(`${push.insertedCount} values were inserted with the id: ${push.insertedId}`);
// 	}
// 	finally {
// 		await client.close();
// 	}
// }
// run().catch(console.dir);

const url1 = "http://localhost:3000/api/data";
const options = { method: "PUSH", body: { "command":"stats" } };
rp.post({
	uri:url1,
	json:{"command":"stats"},
}).then(res => console.log("Succesful transaction with back end."));