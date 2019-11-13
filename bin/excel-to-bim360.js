#!/usr/bin/env node

// Command-line tool for importing issues from XLSX file into BIM360 based on a configuration file generated by the web application.
//
// Note: since the configuration file includes potentially exploitable information (2-legged and 3-legged tokens),
// it is provided in a ZIP archive protected by a password configured in the env. variable CLI_CONFIG_PASSWORD.
//
// Usage:
//    1. Run the server application in this project
//    2. Visit this application's web interface and navigate to the issue page for one of your BIM360 projects
//    3. Use the "Command-Line Config" button at the bottom of the page to download the compressed configuration file
//    4. Extract the configuration JSON from the archive
//    5. Run the following command from the command line:
//        node excel-to-bim360.js <path/to/unzipped/config.json> <path/to/input.xlsx>

const fse = require('fs-extra');

const { importIssues } = require('../helpers/excel');

async function run(configPath, inputPath) {
    try {
        const config = fse.readJsonSync(configPath);
        console.log(`Importing issues from ${inputPath} into BIM360 project ${config.project_id}.`);
        const xlsx = fse.readFileSync(inputPath);
        const results = await importIssues(xlsx, config.issue_container_id, config.three_legged_token);
        console.log(`Done (succeeded: ${results.succeeded.length}, failed: ${results.failed.length}).`)
        if (results.succeeded.length > 0) {
            console.log('Succeeded:');
            console.table(results.succeeded.map(record => record.issue));
        }
        if (results.failed.length > 0) {
            console.log('Failed:');
            console.table(results.failed);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run(process.argv[2], process.argv[3]);
