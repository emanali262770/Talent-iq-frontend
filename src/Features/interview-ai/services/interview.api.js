import api from "../../../lib/AxiosInstance";


export const genrateInterviewReport = async ({jobDescription,selfDescription,resume}) => {
    try{
        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        formData.append("selfDescription", selfDescription);
        formData.append("resume", resume);
        const response = await api.post("/interview", formData, {
            headers: {
                "Content-Type": "multipart/form-data",  
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error generating interview report:", error);
        throw error;
    }
}

export const getInterviewReport = async (reportId) => {
    try {
        const response = await api.get(`/interview/${reportId}`);   
        return response.data;
    } catch (error) {       
        console.error("Error fetching interview report:", error);
        throw error;
    }       
}

export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/interview");
        return response.data;
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        throw error;
    }
}