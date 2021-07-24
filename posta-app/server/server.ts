import path from 'path';
import express from 'express';
import { fetchURLMetadata } from './fetchURLMetadata';
const app = express();
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '..', 'build');
app.use(express.static(publicPath));


app.get('/preview', async function (req, res) {
    if(!req.query || !req.query.url) return res.status(400).send();
    const metadata = await fetchURLMetadata(req.query.url as string);
    return res.status(200).send({metadata: metadata});
});

// app.get('/post/**', function (req, res) {
//     res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });

app.listen(port, () => {
    console.log(`Server is up on port ${port}. =)`);
});