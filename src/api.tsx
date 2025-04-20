import axios from 'axios';

// Define the type for the data you expect to receive from the backend (adjust the type as needed)
interface ResponseData {
  // Example properties, adjust according to your backend response
  id: number;
  name: string;
  email: string;
}

const backendURL = 'http://192.168.1.100/your-api-endpoint.php'; // Replace with your backend URL

// Fetch data from the backend
export const fetchData = async (): Promise<ResponseData[] | undefined> => {
  try {
    const response = await axios.get<ResponseData[]>(backendURL);  // Ensure TypeScript knows what type to expect
    return response.data;
  } catch (error) {
    console.error("There was an error fetching data from the backend:", error);
    return undefined;
  }
};

// Example POST request to send data
export const sendData = async (data: { name: string; email: string }): Promise<ResponseData | undefined> => {
  try {
    const response = await axios.post<ResponseData>(backendURL, data);
    return response.data;
  } catch (error) {
    console.error("There was an error sending data to the backend:", error);
    return undefined;
  }
};
