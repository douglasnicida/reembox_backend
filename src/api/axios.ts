import axios, { CreateAxiosDefaults } from 'axios';

// Função para criar a instância do Axios
const createAxiosInstance = () => {
    const axiosParams = {
        baseURL: "http://localhost:800",
        timeout: 5000
    } as Partial<CreateAxiosDefaults>;

    return axios.create(axiosParams);
};

const api = createAxiosInstance();

export default api;