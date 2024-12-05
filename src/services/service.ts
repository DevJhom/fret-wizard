import axios from 'axios';

type GuitarStrings = {
  [key: string]: string[];
};

const serviceUrl = 'http://localhost:3000';

export const getCurrentKey = async () => {
    try {
        const response = await axios.get(`${serviceUrl}/currentKey`);
        return response.data;
    } catch(error){
        console.log("error:", error);
        return null;
    }
}

export const updateCurrentKey = async (key: string) => {
    try {
        const response = await axios.put(`${serviceUrl}/currentKey`, { key });
        return response.data;
    } catch(error){
        console.log("error:", error);
        return null;
    }
}

export const getScale = async (scale: string, key: string) => {
    try {
        const response = await axios.get(`${serviceUrl}/${scale}`); // /${encodeURIComponent(key)
        return response.data[key];
    } catch(error){
        console.log("error:", error);
        return null;
    }
}

export const updateCurrentScale = async (scale: string) => {
    try {
        const response = await axios.put(`${serviceUrl}/currentScale`, { scale });
        return response.data;
    } catch(error){
        console.log("error:", error);
        return null;
    }
}

export const updateScale = async (scale: string, key: string, guitarStrings: GuitarStrings) => {
    try {
        //To be refactored - update only the necessary data (key)
        //As this is not possible with the simulated json-server
        // const allKeys = await axios.get(`${serviceUrl}/${scale}`);
        // allKeys.data[key] = guitarStrings;

        // const response = await axios.put(`${serviceUrl}/${scale}/`, allKeys.data); 
        // return response.data;
    } catch(error){
        console.log("error:", error);
        return null;
    }
}