'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

import {
    CognitoUser,
    AuthenticationDetails,
    CognitoUserPool,
} from 'amazon-cognito-identity-js';

const smileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#009900" d="M14.36 14.23a3.76 3.76 0 0 1-4.72 0a1 1 0 0 0-1.28 1.54a5.68 5.68 0 0 0 7.28 0a1 1 0 1 0-1.28-1.54Zm-5.15-3.69a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 1 0 1.41 1.41a1 1 0 0 1 1.42 0Zm8.41-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 0 0 1.41 1.41a1 1 0 0 1 1.42 0a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Z"/></svg>`;

const frownSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#990000" d="M8.36 15.33a1 1 0 0 0-.13 1.4a1 1 0 0 0 1.41.13a3.76 3.76 0 0 1 4.72 0a1 1 0 0 0 .64.23a1 1 0 0 0 .64-1.76a5.81 5.81 0 0 0-7.28 0Zm.85-4.79a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41a3.08 3.08 0 0 0-4.24 0a1 1 0 1 0 1.41 1.41a1 1 0 0 1 1.42 0ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Zm5.62-10.87a3.08 3.08 0 0 0-4.24 0a1 1 0 0 0 1.41 1.41a1 1 0 0 1 1.42 0a1 1 0 0 0 1.41 0a1 1 0 0 0 0-1.41Z"/></svg>
`;

const brainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 32; width: 32;">
  <g class="" transform="translate(0,0)" style="">
  <path fill="#009900" d="M241.063 54.406c-2.31.008-4.61.032-6.907.094-1.805.05-3.61.106-5.406.188-8.814 1.567-12.884 5.426-15.094 9.843-2.435 4.87-2.34 11.423.375 17.25 2.717 5.83 7.7 10.596 14.657 12.376 6.958 1.78 16.536.86 29.125-7.187l10.063 15.75c-15.818 10.11-31.124 12.777-43.813 9.53-12.688-3.247-22.103-12.123-26.968-22.563-4.584-9.836-5.426-21.376-1.03-31.624-42.917 6.94-81.777 23.398-111.626 46.562-9.81 10.688-10.77 23.11-6.47 31.594 4.83 9.526 16.21 16.48 38.97 9.28l5.656 17.813c-28.58 9.04-52.137-.588-61.28-18.625-2.23-4.397-3.592-9.156-4.127-14.063-4.814 5.712-9.16 11.658-13 17.844l.126.06c-8.614 19.616-8.81 33.203-5.376 42.032 3.436 8.83 10.635 14.44 21.72 17.532 22.168 6.18 58.065-1.277 83.343-20.156 10.82-8.08 21.077-27.677 21.97-42.875.445-7.6-1.165-13.604-4.345-17.438-3.18-3.834-8.272-6.703-18.813-6.594l-.187-18.686c14.487-.15 26.25 4.754 33.375 13.344 7.124 8.59 9.26 19.652 8.625 30.468-1.27 21.633-12.595 44.172-29.438 56.75-29.876 22.314-69.336 31.606-99.53 23.188-13.988-3.9-26.37-12.386-32.75-25.53-9.546 45.446 4.323 87.66 30.718 116.874 3.45 3.82 7.122 7.43 10.97 10.78-2.754-7.887-4.016-16.1-3.72-24.093.53-14.325 6.082-28.346 17.22-38.03 9.134-7.946 21.752-12.53 36.843-12.5 1.006 0 2.034.018 3.062.06 2.35.1 4.763.304 7.22.626l-2.44 18.532c-15.588-2.048-25.705 1.522-32.436 7.375-6.73 5.854-10.443 14.614-10.813 24.625-.74 20.024 12.07 43.406 39.69 50.188l-.032.188c27.192 5.19 57.536.372 88-18.22.018-.012.043-.017.062-.03 6.34-4.45 9.755-8.808 11.438-12.563 1.985-4.432 1.943-8.292.53-12.438-2.824-8.29-12.94-16.812-22.218-19.187-15.002-3.84-24.532 1.436-29 7.72-4.468 6.28-4.74 12.45 2.156 17.81l-11.47 14.75c-14.187-11.033-15.092-30.487-5.905-43.405 6.892-9.688 18.985-16.326 33.564-16.75.607-.018 1.228-.036 1.844-.03 4.306.03 8.79.622 13.437 1.81 15.505 3.97 29.84 15.277 35.28 31.25 1.416 4.155 2.09 8.69 1.876 13.314 16.71-8.538 34.332-16.12 52.282-21.814 30.156-13.78 43.23-37.938 42.72-58.28-.515-20.493-13.187-37.74-42.376-40.626l1.844-18.594c36.666 3.626 58.462 29.848 59.188 58.75.422 16.84-5.754 34.363-18.188 49.28 16.072-1.8 32.044-1.495 47.53 1.627-3.152-6.472-4.68-13.478-4.467-20.438.677-22.036 19.42-42.593 48.875-42.906 1.963-.022 3.974.053 6.03.218l-1.5 18.625c-24.927-1.998-34.3 11.086-34.718 24.656-.412 13.42 8.545 28.442 34.22 30.436 28.3.25 48.588-15.098 58.53-37.906 13.31-30.536 6.997-76.317-34.844-118.188-.792-.793-1.578-1.593-2.375-2.375-.444 3.792-1.424 7.443-2.842 10.844-7.25 17.39-24.233 29.128-41.875 32.407-24.335 4.522-44.29-5.347-53.5-20.406-9.21-15.057-6.792-36.35 9.78-47.56l10.47 15.5c-8.913 6.028-9.28 14.19-4.313 22.31 4.967 8.122 16.17 15.156 34.156 11.814 11.306-2.102 23.896-11.33 28.03-21.25 2.07-4.96 2.47-9.862.408-15.47-1.675-4.555-5.187-9.764-11.72-15.25l-.187-.155c-27.316-20.587-56.338-35.393-85.75-45.157.018.032.045.06.063.093 6.684 12.22 7.18 26.082 3.063 38.344-8.233 24.525-34.07 43.848-66.032 42.78-6.948-.23-13.56 3.12-19.186 9.657-5.627 6.537-9.735 16.113-10.688 26.313-1.905 20.4 6.923 42.886 41.344 54L277 258.28c-41.083-13.264-56.83-45.546-54.22-73.5 1.307-13.975 6.706-26.962 15.157-36.78 8.452-9.818 20.475-16.603 33.97-16.156 24.04.802 42.323-14.084 47.687-30.063 2.682-7.988 2.335-15.937-1.75-23.405-3.968-7.252-11.83-14.423-25.906-19.656-17.114-2.967-34.16-4.367-50.875-4.314zM342.28 306.344c-41.915 3.41-87.366 23.4-125.28 46.562-55.98 34.198-114.89 26.733-156.688-4.28 16.444 58.844 74.712 70.788 135.5 55.905 6.083-2.285 12.06-6.538 17.157-12.03 7.057-7.607 12.17-17.47 13.78-25.625l18.344 3.625c-2.445 12.383-9.078 24.666-18.406 34.72-8.95 9.645-20.61 17.35-34.094 19.374-6.766 15.07-12.334 29.68-14.594 39.906-3.55 16.06 14.206 22.225 22.156 6.03 19.022-38.743 45.87-73.23 79.406-102.967 26.064-17.153 48.406-38.303 62.72-61.22z" fill="#fff" fill-opacity="1"></path>
  </g>
</svg>`;

const stupidBrainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12.731 -12.294 544.776 544.776" style="height: 29; width: 32;">
  <g class="" transform="translate(0,0)" style="">
  <path fill="#990000" d="M241.063 54.406c-2.31.008-4.61.032-6.907.094-1.805.05-3.61.106-5.406.188-8.814 1.567-12.884 5.426-15.094 9.843-2.435 4.87-2.34 11.423.375 17.25 2.717 5.83 7.7 10.596 14.657 12.376 6.958 1.78 16.536.86 29.125-7.187l10.063 15.75c-15.818 10.11-31.124 12.777-43.813 9.53-12.688-3.247-22.103-12.123-26.968-22.563-4.584-9.836-5.426-21.376-1.03-31.624-42.917 6.94-81.777 23.398-111.626 46.562-9.81 10.688-10.77 23.11-6.47 31.594 4.83 9.526 16.21 16.48 38.97 9.28l5.656 17.813c-28.58 9.04-52.137-.588-61.28-18.625-2.23-4.397-3.592-9.156-4.127-14.063-4.814 5.712-9.16 11.658-13 17.844l.126.06c-8.614 19.616-8.81 33.203-5.376 42.032 3.436 8.83 10.635 14.44 21.72 17.532 22.168 6.18 58.065-1.277 83.343-20.156 10.82-8.08 21.077-27.677 21.97-42.875.445-7.6-1.165-13.604-4.345-17.438-3.18-3.834-8.272-6.703-18.813-6.594l-.187-18.686c14.487-.15 26.25 4.754 33.375 13.344 7.124 8.59 9.26 19.652 8.625 30.468-1.27 21.633-12.595 44.172-29.438 56.75-29.876 22.314-69.336 31.606-99.53 23.188-13.988-3.9-26.37-12.386-32.75-25.53-9.546 45.446 4.323 87.66 30.718 116.874 3.45 3.82 7.122 7.43 10.97 10.78-2.754-7.887-4.016-16.1-3.72-24.093.53-14.325 6.082-28.346 17.22-38.03 9.134-7.946 21.752-12.53 36.843-12.5 1.006 0 2.034.018 3.062.06 2.35.1 4.763.304 7.22.626l-2.44 18.532c-15.588-2.048-25.705 1.522-32.436 7.375-6.73 5.854-10.443 14.614-10.813 24.625-.74 20.024 12.07 43.406 39.69 50.188l-.032.188c27.192 5.19 57.536.372 88-18.22.018-.012.043-.017.062-.03 6.34-4.45 9.755-8.808 11.438-12.563 1.985-4.432 1.943-8.292.53-12.438-2.824-8.29-12.94-16.812-22.218-19.187-15.002-3.84-24.532 1.436-29 7.72-4.468 6.28-4.74 12.45 2.156 17.81l-11.47 14.75c-14.187-11.033-15.092-30.487-5.905-43.405 6.892-9.688 18.985-16.326 33.564-16.75.607-.018 1.228-.036 1.844-.03 4.306.03 8.79.622 13.437 1.81 15.505 3.97 29.84 15.277 35.28 31.25 1.416 4.155 2.09 8.69 1.876 13.314 16.71-8.538 34.332-16.12 52.282-21.814 30.156-13.78 43.23-37.938 42.72-58.28-.515-20.493-13.187-37.74-42.376-40.626l1.844-18.594c36.666 3.626 58.462 29.848 59.188 58.75.422 16.84-5.754 34.363-18.188 49.28 16.072-1.8 32.044-1.495 47.53 1.627-3.152-6.472-4.68-13.478-4.467-20.438.677-22.036 19.42-42.593 48.875-42.906 1.963-.022 3.974.053 6.03.218l-1.5 18.625c-24.927-1.998-34.3 11.086-34.718 24.656-.412 13.42 8.545 28.442 34.22 30.436 28.3.25 48.588-15.098 58.53-37.906 13.31-30.536 6.997-76.317-34.844-118.188-.792-.793-1.578-1.593-2.375-2.375-.444 3.792-1.424 7.443-2.842 10.844-7.25 17.39-24.233 29.128-41.875 32.407-24.335 4.522-44.29-5.347-53.5-20.406-9.21-15.057-6.792-36.35 9.78-47.56l10.47 15.5c-8.913 6.028-9.28 14.19-4.313 22.31 4.967 8.122 16.17 15.156 34.156 11.814 11.306-2.102 23.896-11.33 28.03-21.25 2.07-4.96 2.47-9.862.408-15.47-1.675-4.555-5.187-9.764-11.72-15.25l-.187-.155c-27.316-20.587-56.338-35.393-85.75-45.157.018.032.045.06.063.093 6.684 12.22 7.18 26.082 3.063 38.344-8.233 24.525-34.07 43.848-66.032 42.78-6.948-.23-13.56 3.12-19.186 9.657-5.627 6.537-9.735 16.113-10.688 26.313-1.905 20.4 6.923 42.886 41.344 54L277 258.28c-41.083-13.264-56.83-45.546-54.22-73.5 1.307-13.975 6.706-26.962 15.157-36.78 8.452-9.818 20.475-16.603 33.97-16.156 24.04.802 42.323-14.084 47.687-30.063 2.682-7.988 2.335-15.937-1.75-23.405-3.968-7.252-11.83-14.423-25.906-19.656-17.114-2.967-34.16-4.367-50.875-4.314zM342.28 306.344c-41.915 3.41-87.366 23.4-125.28 46.562-55.98 34.198-114.89 26.733-156.688-4.28 16.444 58.844 74.712 70.788 135.5 55.905 6.083-2.285 12.06-6.538 17.157-12.03 7.057-7.607 12.17-17.47 13.78-25.625l18.344 3.625c-2.445 12.383-9.078 24.666-18.406 34.72-8.95 9.645-20.61 17.35-34.094 19.374-6.766 15.07-12.334 29.68-14.594 39.906-3.55 16.06 14.206 22.225 22.156 6.03 19.022-38.743 45.87-73.23 79.406-102.967 26.064-17.153 48.406-38.303 62.72-61.22z" fill="#fff" fill-opacity="1"></path>
  </g>
  <polyline style="fill: rgb(255, 0, 0); paint-order: fill; stroke: rgb(0, 0, 0);" points="102.234 68.088 455.316 417.991 439.255 440.592 81.405 84.74"></polyline>
  <path style="fill: rgb(255, 0, 0); stroke: rgb(0, 0, 0);" d="M 259.657 260.094 m -272.388 0 a 272.388 272.388 0 1 0 544.776 0 a 272.388 272.388 0 1 0 -544.776 0 Z M 259.657 260.094 m -246.331 0 a 246.331 246.331 0 0 1 492.662 0 a 246.331 246.331 0 0 1 -492.662 0 Z" data-bx-shape="ring 259.657 260.094 246.331 246.331 272.388 272.388 1@afe3965b"></path>
</svg>`;

const wrenchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 32; width: 32;">
  <g class="" transform="translate(0,0)" style="">
  <path fill="#009900" d="M331.188 16.72c-40.712-.002-81.41 15.408-112.438 46.436-43.866 43.864-56.798 107-38.813 162.25L17.03 388.312v25.75l170.22-170.218c2.75 5.84 5.847 11.555 9.344 17.094L17.03 440.5v51.78H64l181.875-181.874c5.516 3.515 11.212 6.668 17.03 9.438L90.44 492.28h27.03l164.75-164.75c55.182 17.85 118.21 4.884 162-38.905 41.415-41.414 54.998-99.91 41.282-152.813L380.22 241.125l-90.033-23.938-23.968-90.03L371.53 21.843c-13.213-3.41-26.772-5.125-40.342-5.125z" fill="#fff" fill-opacity="1"></path>
  </g>
</svg>`;

const brokenWrenchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12.731 -12.294 544.776 544.776" style="height: 29; width: 32;">
  <path fill="#990000" d="M 331.188 16.72 C 290.476 16.718 249.778 32.128 218.75 63.156 C 174.884 107.02 161.952 170.156 179.937 225.406 L 17.03 388.312 L 17.03 414.062 L 187.25 243.844 C 190 249.684 193.097 255.399 196.594 260.938 L 17.03 440.5 L 17.03 492.28 L 64 492.28 L 245.875 310.406 C 251.391 313.921 257.087 317.074 262.905 319.844 L 90.44 492.28 L 117.47 492.28 L 282.22 327.53 C 337.402 345.38 393.021 322.701 393.161 322.31 L 380.22 241.125 L 290.187 217.187 L 266.219 127.157 L 371.53 21.843 C 358.317 18.433 344.758 16.718 331.188 16.718 L 331.188 16.72 Z" fill="#fff" fill-opacity="1"></path>
  <polyline style="fill: rgb(255, 0, 0); paint-order: fill; stroke: rgb(0, 0, 0);" points="102.234 68.088 455.316 417.991 439.255 440.592 81.405 84.74"></polyline>
  <path style="fill: rgb(255, 0, 0); stroke: rgb(0, 0, 0);" d="M 259.657 260.094 m -272.388 0 a 272.388 272.388 0 1 0 544.776 0 a 272.388 272.388 0 1 0 -544.776 0 Z M 259.657 260.094 m -246.331 0 a 246.331 246.331 0 0 1 492.662 0 a 246.331 246.331 0 0 1 -492.662 0 Z" data-bx-shape="ring 259.657 260.094 246.331 246.331 272.388 272.388 1@afe3965b"></path>
</svg>`;

const isGoogle = window.location.href.indexOf("www.google.com") != -1;

const startTime = Date.now();
// Add extra space before scores have loaded to prevent bias
const hideSearches = () => {
    const resultsStats = document.getElementById("search");
    resultsStats.insertAdjacentHTML(
        'beforebegin',
        `<div id="mindfulness-loading">
            <label class="mindfulness-loading">Loading scores...</label>
            <div class="mindfulness-loading" style="width: 150px; height: 5000px;"></div>
        </div>`
    );
};

const getSearchTerm = () => {
    const searchTerm = document.getElementById("APjFqb").value;
    return searchTerm;
}

if (isGoogle){
    //hideSearches();
}

const USER_POOL_ID = 'us-east-1_HE1YLkYkh';
const CLIENT_ID = 'bph80t0c4clmadl6249fpv8p9';

const poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
};
const cognitoPool = new CognitoUserPool(poolData);

const authDetails = new AuthenticationDetails({
    Username: 'test11111',
    Password: 'Test12345!',
});
const userData = {
    Username: 'test11111',
    Pool: cognitoPool,
};
const cognitoUser = new CognitoUser(userData);
cognitoUser.authenticateUser(authDetails, {
    onSuccess: function (result) {
        const accessToken = result.getAccessToken();
        const jwtToken = accessToken.getJwtToken();
        const expires = accessToken.getExpiration();
        const username = accessToken.payload.username;
        const userEmail = result.idToken.payload.email;
        const sub = result.idToken.payload.sub;

        // Get username from Chrome storage and get scores from websites
        let pluginUsername = { username: 'Username' };
        chrome.storage.sync.get("username", function (obj) {
            pluginUsername.username = obj.username;
            if (isGoogle) {
                getScores();
            }
        });

        const getLinks = () => {
            const resultsArray = [];
            const urls = [];
            // Get all components and urls of valid websites that should have scores (no YouTube videos, no dropdown lists, no "Discussions and forums", no horizontal list)
            for (const x of document.getElementsByClassName("MjjYud")) {
                const firstChild = x.getElementsByClassName("g Ww4FFb vt6azd tF2Cxc asEBEc").item(0);
                if (firstChild !== null && firstChild.parentElement == x && firstChild.getAttribute("jscontroller") === "SC7lYd") {
                    const link = firstChild.querySelector('a');
                    urls.push(link.href)
                    resultsArray.push(x);
                }
            }

            for (const x of document.getElementsByClassName("sATSHe")) {
                const firstChild = x.getElementsByClassName("g Ww4FFb vt6azd tF2Cxc asEBEc").item(0);
                if (firstChild !== null && firstChild.parentElement == x && firstChild.getAttribute("jscontroller") === "SC7lYd") {
                    const link = firstChild.querySelector('a');
                    urls.push(link.href)
                    resultsArray.push(x);
                }
            }

            // Add loading text to all valid components
            for (const component of resultsArray) {
                component.insertAdjacentHTML(
                    'afterend',
                    `<div class="mindfulness-loading">
                        <label class="mindfulness-loading">Loading scores...</label>
                    </div>`
                );
            }
            return {results: resultsArray, urls: urls}
        }

        const getScores = async () => {
            const {results: resultsArray, urls} = getLinks();
            console.log(resultsArray);
            console.log(urls);

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                    Origin: 'https://www.google.com',
                },
            };
            // const batchResponses = await fetch(
            //     `https://9jokmafle1.execute-api.us-east-1.amazonaws.com/prod/sentiment-efs`,
            //     {
            //         ...options,
            //         body: JSON.stringify({
            //             links: urls,
            //             eventTime: Date.now(),
            //             device: 'desktop',
            //             userId: pluginUsername.username,
            //             searchTerm: getSearchTerm(),
            //         }),
            //     }
            // ).catch(error => {console.log(error); return "Error!";});

            const searchTime = Date.now();
            const placeScore = async (index, response) => {
                let noResults;
                let scores;
                if (response === "Error!"){
                    noResults = true;
                } else {
                    const jsons = await response.json();
                    // console.log(Date.now() - startTime);
                    scores = jsons.body.scores;
                }
                // Get raw scores (-1 to 1, can sometimes be -2 if error on Lambda side) from received jsons
                const rawEmotionScore = noResults ? 0 : scores.emotion[0];
                const rawActionScore = noResults ? 0 : scores.usefulness[0];
                const rawKnowledgeScore = noResults ? 0 : scores.knowledge[0];

                // Convert to user-friendly scores (0 to 100)
                const emotionScore = Number((rawEmotionScore + 1) / 2 * 100).toFixed(0);
                const actionScore = Number((rawActionScore + 1) / 2 * 100).toFixed(0);
                const knowledgeScore = Number((rawKnowledgeScore + 1) / 2 * 100).toFixed(0);

                // Create click function to add to all links which sends data about the clicked link to database
                const click = (clickedUrl, time) => {
                    fetch(
                        `https://9jokmafle1.execute-api.us-east-1.amazonaws.com/prod/sentiment-efs`,
                        {
                            ...options,
                            body: JSON.stringify({
                                links: [],
                                eventTime: time,
                                device: 'desktop',
                                clickedUrl: clickedUrl,
                                userId: pluginUsername.username,
                                searchTerm: getSearchTerm(),
                            }),
                        }
                    )
                }

                // Add click function under the click event to link
                resultsArray[index].querySelector('a').addEventListener("click", function() {click(resultsArray[index].querySelector('a').href, searchTime)});

                const loadingElements = resultsArray[index].parentElement.getElementsByClassName('mindfulness-loading');
                loadingElements[0].remove();

                // If score is -2, null, or NaN, the actual score couldn't be calculated for some reason; show this to the user
                if (rawEmotionScore == -2 || emotionScore == null || emotionScore == NaN || rawEmotionScore == undefined || noResults){
                    resultsArray[index].insertAdjacentHTML(
                        'afterend',
                        `<div>
                            <style>
                            #no-score-text {
                                font-weight: bold;
                                width: 350px;
                            }
                            </style>
                            <label id="no-score-text">No scores available</label>
                            <div style="width: 350px; height: 50px;"></div>
                        </div>`
                    );
                } else { // Otherwise, show the scores to the user
                    resultsArray[index].insertAdjacentHTML(
                        'afterend',
                        `<div style="display: flex; flex-direction: column; align-items: start; gap: 0.01rem;">
                            <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <style>
                                label {
                                    display: block;
                                    width: 150px;
                                }

                                label .tooltiptext {
                                    visibility: hidden;
                                    background-color: black;
                                    text-align: center;
                                    padding: 5px 10px;
                                    border-radius: 6px;
                                    
                                    /* Position the tooltip text - see examples below! */
                                    position: absolute;
                                    z-index: 1;
                                }

                                label:hover .tooltiptext {
                                    visibility: visible;
                                }
                            </style>
                            <label for="emotion">Emotion 
                                <span style="float:right;">${emotionScore}</span>
                                <span class="tooltiptext">This value indicates the emotional tone of the webpage</span>
                            </label>
                            ${frownSvg}
                            <div style="width:100px;height:16px;background-color: #dedede;border-radius:4px;">
                                <div style="width:${emotionScore
                                    }%;height:100%;background-color: #f1c40f;border-radius:4px;"></div>
                            </div>
                            ${smileSvg}
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <label for="knowledge">Knowledge 
                                <span style="float:right;">${knowledgeScore}</span>
                                <span class="tooltiptext">This value indicates whether the informatioin on the webpage is likely to increase your understanding of its topic</span>
                            </label>
                            ${stupidBrainSvg}
                            <div style="width:100px;height:16px;background-color: #dedede;border-radius:4px;">
                                <div style="width:${knowledgeScore
                                    }%;height:100%;background-color: #0D5FCE;border-radius:4px;"></div>
                            </div>
                            ${brainSvg}
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 0.4rem;">
                            <label for="action">Actionability 
                                <span style="float:right;">${actionScore}</span>
                                <span class="tooltiptext">This value indicates whether the information on the webpage is likely to help guide your actions and/or decisions</span>
                            </label>
                            ${brokenWrenchSvg}
                            <div style="width:100px;height:16px;background-color: #dedede;border-radius:4px;">
                                <div style="width:${actionScore
                                    }%;height:100%;background-color: #2CE93F;border-radius:4px;"></div>
                            </div>
                            ${wrenchSvg}
                            </div>
                        </div>`
                    );
                }
            }

            // Send separate response for each valid url for better UX experience (less perceived loading, more actual loading off-screen)
            for (var i = 0; i < urls.length; i++) {
                const response = await fetch(
                    `https://9jokmafle1.execute-api.us-east-1.amazonaws.com/prod/sentiment-efs`,
                    {
                        ...options,
                        body: JSON.stringify({
                            links: [urls[i]],
                            eventTime: searchTime,
                            device: 'desktop',
                            userId: pluginUsername.username,
                            searchTerm: getSearchTerm(),
                        }),
                    }
                ).catch(error => {console.log(error); return "Error!";}).then(async value => {placeScore(i, value)});
            }
            // Remove extra space after all scores have loaded
            //document.getElementById("mindfulness-loading").remove();
        };

    },

    onFailure: function (err) {
        console.log(err);
    },
});
// Communicate with background file by sending a message
// chrome.runtime.sendMessage(
//   {
//     type: 'GREETINGS',
//     payload: {
//       message: 'Hello, my name is Con. I am from ContentScript.',
//     },
//   },
//   (response) => {
//     console.log(response.message);
//   }
// );

// Listen for message
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'COUNT') {
//     console.log(`Current count is ${request.payload.count}`);
//   }

// Send an empty response
// See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
//   sendResponse({});
//   return true;
// });