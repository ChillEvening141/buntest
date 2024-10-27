// proxy.js
const express = require('express');
const request = require('request');
const cheerio = require('cheerio'); // Using cheerio to parse HTML
const app = express();
const PORT = process.env.PORT || 3000; // This will allow the app to run on Heroku or any other cloud service


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

app.get('/proxy', (req, res) => {
    const url = req.query.url || 'https://www.bunnings.com.au/search/products?page=1&q=remote&sort=BoostOrder';
    
    // Use the request module to fetch the page
    request(url, (error, response, body) => {
        if (error) {
            return res.status(500).send('Error fetching the page');
        }
        
        // Load the HTML into Cheerio for parsing
        const $ = cheerio.load(body);
        
        // Select the specific container div with the class you want
        const selectedDiv = $('.sc-27b153a3-12.eXhTus');

        // If the div exists, modify the contents
        if (selectedDiv.length) {
            selectedDiv.find('.search-product-tile').each((index, tile) => {
                const dataCode = $(tile).attr('data-code'); // Get the data-code value
                const dataCodeDiv = `<div class="data-code-container"><p>I/N: ${dataCode}</p></div>`;
                
                // Find the compare wrapper and replace it
                $(tile).find('.search-compare-wrapper').html(dataCodeDiv); // Append new data-code div
            });

            // Define your custom styles for grid layout
            const customStyles = `
                <style>
                    body {
                        margin: 0;
                        padding: 0; /* Remove default padding */
                        overflow-y: auto; /* Allow vertical scrolling */
                        overflow-x: hidden; /* Prevent horizontal scrolling */
                    }
                    .sc-27b153a3-12.eXhTus {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Responsive grid layout */
                        gap: 16px;
                        padding: 10px;
                        width: 100%; /* Ensure full width */
                        box-sizing: border-box; /* Include padding in width */
                    }
                    .search-product-tile {
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 10px;
                        text-align: center;
                        background-color: #fff;
                        transition: box-shadow 0.3s; /* Smooth shadow transition */
                    }
                    .search-product-tile:hover {
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow on hover */
                    }
                    .data-code-container {
                        margin-top: 10px;
                        font-weight: bold;
                    }
                </style>
            `;

            // Send the modified content with the custom styles included
            res.send(customStyles + selectedDiv.html());
        } else {
            res.status(404).send('Div not found');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
