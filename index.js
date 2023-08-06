const fs = require("fs");
const request = require("request");
const requestPromise = require("request-promise");
const xml2js = require('xml2js');
var { google } = require("googleapis");
var key = require("./service_account.json");

const parser = new xml2js.Parser();

// Replace with the URL of your sitemap
const sitemapUrl = 'https://example.com/sitemap.xml';

requestPromise(sitemapUrl)
    .then(sitemap => {
        parser.parseStringPromise(sitemap)
            .then(result => {
                const urls = result.urlset.url.map(urlEntry => urlEntry.loc[0]);

                // Append URLs to urls.txt
                fs.writeFileSync('urls.txt', urls.join('\n'));

                processUrls();
            })
            .catch(error => console.error('Error parsing XML:', error));
    })
    .catch(error => console.error('Error fetching sitemap:', error));

function processUrls() {
    let batch = fs.readFileSync("urls.txt").toString().split("\n");

    // Read log.txt and extract logged URLs
    let loggedUrls = fs.readFileSync("log.txt", "utf-8").split('\n');

    // Exclude logged URLs from batch
    batch = batch.filter(url => !loggedUrls.includes(url));

    // Limit to 200 URLs
    batch = batch.slice(0, 200);

    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ["https://www.googleapis.com/auth/indexing"],
        null
    );

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        }

        const operationType =
            process.argv[2] === "--delete" ? "URL_DELETED" : "URL_UPDATED";

        const items = batch.map((line) => {
            return {
                "Content-Type": "application/http",
                "Content-ID": "",
                body:
                    "POST /v3/urlNotifications:publish HTTP/1.1\n" +
                    "Content-Type: application/json\n\n" +
                    JSON.stringify({
                        url: line,
                        type: operationType,
                    }),
            };
        });

        const options = {
            url: "https://indexing.googleapis.com/batch",
            method: "POST",
            headers: {
                "Content-Type": "multipart/mixed",
            },
            auth: { bearer: tokens.access_token },
            multipart: items,
        };
      
        request(options, (err, resp, body) => {
            if(err) {
                console.log(err);
            } else {
                console.log("Request completed");
            }
            // Log all the URLs processed
            batch.forEach(url => {
                fs.appendFileSync('log.txt', url + '\n');
            });
        });
    });
}
