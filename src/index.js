import { PrismaClient } from "@prisma/client";
import dns from "dns";
import express from "express";
import Joi from "joi";
import { nanoid } from "nanoid";

const app = express();


app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())
app.use(express.static("src/public"))

// db config
const db = new PrismaClient();

app.post("/shorten-url", async (req, res) => {
    let {url, userId} = req.body;
    const schema = Joi.object({
        url: Joi.string().required().uri(),
        userId: Joi.string(),
        domain: Joi.string().required()
    })
    const { error, value } = schema.validate(req.body);
    if (error != null) {
        return res.status(400).json({
            "message": error.message
        })
    }
    // return dns.lookup(url, async (err) => {
    //     if (err) {
    //         console.log(err)
    //         return res.status(500).json({"message": "domain does not exist."})
    //     }
    // })
    let existing = await db.history.findFirst({
        where: {originalUrl: url}
    })
    if (existing == null) { // which means does not exist
        // create
        const code = nanoid(4) // create a new code for the new url
        const host = req.get("host")
        if (userId == null) userId = nanoid(10)
        existing = await db.history.create({
            data: {
                originalUrl: value.url,
                shortUrl: `${host}/${code}`,
                code: code,
                userId: userId,
                domain: value.domain
            }
        })
    }
    return res.json(existing)

})

app.get("/:code", async (req, res) => {
    const shorten = await db.history.findFirst({
        where: {
            code: req.params.code
        }
    })
    if (shorten == null) {
        return res.send("Url does not existing")
    }

    res.redirect(shorten.originalUrl);
})
app.get("/history/:userId", async (req, res) => {
    const shortenUrls = await db.history.findMany({
        where: {
            userId: req.params.userId
        }
    })

    res.json(shortenUrls);
})


app.listen(4000, () => console.log('Server started at 4000'))