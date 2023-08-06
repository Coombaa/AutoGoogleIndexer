# Automated Google Search Console URL Submission Script

This Node.js script is used to fetch URLs from a sitemap, process and submit them to the Google Search Console's Indexing API. The script will process the first 200 URLs that have not been previously processed and log the processed URLs to a text file.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* Node.js is installed on your system.
* You have a `service_account.json` file that contains the service account credentials. Please follow Google's [documentation](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount) to create a service account and generate this file.
* You have a Google Search Console property verified.

## Installing

To install the necessary dependencies, use the following command:

npm install xml2js request request-promise googleapis

## Using the Script

Replace `'https://example.com/sitemap.xml'` in the script with your actual sitemap URL.

Run the script using the following command:

node index.js

Optionally, you can pass the `--delete` argument if you wish to notify Google that the URLs have been deleted:

node index.js --delete

After the script runs, you can check the `log.txt` file to see which URLs have been processed.

If you want to fully automate this process then simply create a cronjob/scheduled task to run the script every 24 hours.

## Limitations

By default the script only processes 200 URLs at a time to respect Google's 200 per day publishing quota. If you have a higher quota, you can adjust the `batch = batch.slice(0, 200);` accordingly.
