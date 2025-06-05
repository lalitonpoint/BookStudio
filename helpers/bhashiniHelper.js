require('dotenv').config();
const axios = require('axios');
const { detect } = require("langdetect");
const langs = require('langs');

const languageCodes = {
    "Hindi": "hi",
    "Gom": "gom",
    "Kannada": "kn",
    "Dogri": "doi",
    "Bodo": "brx",
    "Urdu": "ur",
    "Tamil": "ta",
    "Kashmiri": "ks",
    "Assamese": "as",
    "Bengali": "bn",
    "Marathi": "mr",
    "Sindhi": "sd",
    "Maithili": "mai",
    "Punjabi": "pa",
    "Malayalam": "ml",
    "Manipuri": "mni",
    "Telugu": "te",
    "Sanskrit": "sa",
    "Nepali": "ne",
    "Santali": "sat",
    "Gujarati": "gu",
    "Odia": "or",
    "English": "en",
};


// const BHASHINI_USER_ID = process.env.BHASHINI_USER_ID;
// const BHASHINI_API_KEY = process.env.BHASHINI_API_KEY;
const userID = "88f49ea99b014aadad08858c6e18e710"; // Replace with your actual user ID
const ulcaApiKey = "3125265d3a-1636-49ba-afa0-9fe498c16345"; // Replace with your actual API key

async function translateText(content, targetLanguage) {
    try {
        // Detect source language
        let detectedLanguages = detect(content);
        // console.log(`Detected language: ${detectedLang}`);

        if (detectedLanguages.length > 0) {
            detectedLang = detectedLanguages[0].lang; // Get the most probable language code
            language = langs.where("1", langCode); // Map it to the full name

            // console.log(`Detected Language: ${language ? language.name : 'Unknown'}`);
            // console.log(langCode);
        }

        if (detectedLang === "id") detectedLang = "en"; // Treat 'id' as English
        const sourceLanguage = Object.keys(languageCodes).find(key => languageCodes[key] === detectedLang);

        if (!sourceLanguage || !languageCodes[targetLanguage]) {
            return {
                status_code: 400,
                message: "Invalid language code",
                translated_content: null,
            };
        }

        if (sourceLanguage === targetLanguage) {
            return {
                status_code: 200,
                message: "Source and target languages are the same, no translation needed",
                translated_content: content,
            };
        }

        // Request model configuration
        const modelConfigPayload = {
            pipelineTasks: [
                {
                    taskType: "translation",
                    config: {
                        language: {
                            sourceLanguage: languageCodes[sourceLanguage],
                            targetLanguage: languageCodes[targetLanguage],
                        },
                    },
                },
            ],
            pipelineRequestConfig: { pipelineId: "64392f96daac500b55c543cd" },
        };

        const headers = {
            "Content-Type": "application/json",
            userID,
            ulcaApiKey,
        };

        const modelConfigResponse = await axios.post(
            "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
            modelConfigPayload,
            { headers }
        );

        if (modelConfigResponse.status !== 200) {
            return {
                status_code: modelConfigResponse.status,
                message: "Error in translation request",
                translated_content: null,
            };
        }

        const serviceId = modelConfigResponse.data.pipelineResponseConfig[0].config[0].serviceId;
        const callbackUrl = modelConfigResponse.data.pipelineInferenceAPIEndPoint.callbackUrl;
        const inferenceApiKey = modelConfigResponse.data.pipelineInferenceAPIEndPoint.inferenceApiKey;

        // Prepare translation request payload
        const translationPayload = {
            pipelineTasks: [
                {
                    taskType: "translation",
                    config: {
                        language: {
                            sourceLanguage: languageCodes[sourceLanguage],
                            targetLanguage: languageCodes[targetLanguage],
                        },
                        serviceId,
                    },
                },
            ],
            inputData: { input: [{ source: content }], audio: [{ audioContent: null }] },
        };

        const translationHeaders = {
            "Content-Type": "application/json",
            [inferenceApiKey.name]: inferenceApiKey.value,
        };

        const translationResponse = await axios.post(callbackUrl, translationPayload, { headers: translationHeaders });

        if (translationResponse.status === 200) {
            const translatedText = translationResponse.data.pipelineResponse[0].output[0].target;
            return {
                status_code: 200,
                message: "Translation successful",
                translated_content: translatedText,
            };
        } else {
            return {
                status_code: translationResponse.status,
                message: "Error in translation",
                translated_content: null,
            };
        }
    } catch (error) {
        console.error("Translation Error:", error.message);
        return {
            status_code: 500,
            message: "Internal Server Error",
            translated_content: null,
        };
    }
}

module.exports = translateText;
