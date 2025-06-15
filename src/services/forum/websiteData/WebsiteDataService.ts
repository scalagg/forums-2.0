'use server';

import HTTPClient from "@/libs/HTTPClient";
import WebEntry from "@/libs/types/entities/WebEntry";

// Default values for website data
const DEFAULT_WEBSITE_DATA: { [key: string]: string } = {
    headline: "Welcome to Scala",
    headlineColor: "#ffffff",
    highlightThreadMain: "",
    highlightThread0: "",
    highlightThread1: "",
    highlightThread2: "",
    highlightThread3: "",
    highlightThread4: ""
};

export const getEntry = async (id: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    try {
        const [data, status, error] = await client.GetAsync<WebEntry>(`/websiteData/${id}`);
        if (error || !data) {
            console.warn(`Failed to fetch website data for ${id}, using default value`);
            return DEFAULT_WEBSITE_DATA[id] || "";
        }
        return data.value;
    } catch (error) {
        console.warn(`Error fetching website data for ${id}, using default value`);
        return DEFAULT_WEBSITE_DATA[id] || "";
    }
};

export const getAllEntries = async(client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    try {
        const [data, status, error] = await client.GetAsync<WebEntry[]>("/websiteData");
        if (error || !data) {
            console.warn("Failed to fetch website data, using default values");
            return Object.entries(DEFAULT_WEBSITE_DATA).map(([_id, value]) => ({
                _id,
                value,
                type: "string"
            }));
        }
        return data;
    } catch (error) {
        console.warn("Error fetching website data, using default values");
        return Object.entries(DEFAULT_WEBSITE_DATA).map(([_id, value]) => ({
            _id,
            value,
            type: "string"
        }));
    }
};

export const updateEntry = async (entry: WebEntry, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    try {
        const [_, status, error] = await client.PostAsync<void>(`/websiteData`, entry, true);
        if (error) {
            console.error(`Failed to update website data for ${entry._id}: ${error}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error updating website data for ${entry._id}:`, error);
        return false;
    }
};
