import api from "../../../lib/AxiosInstance";

export const genrateInterviewReport = async ({ jobDescription, selfDescription, resume }) => {
  try {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resume);
    const response = await api.post("/interview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error generating interview report:", error);
    throw error;
  }
};

export const getInterviewReport = async (reportId) => {
  try {
    const response = await api.get(`/interview/${reportId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching interview report:", error);
    throw error;
  }
};

export const getAllInterviewReports = async () => {
  try {
    const response = await api.get("/interview");
    return response.data;
  } catch (error) {
    console.error("Error fetching interview reports:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// AUTHENTICATED MOCK INTERVIEW API ENDPOINTS
// Base path: /api/interview/mock
// Supports JWT token via Authorization header and credentials: "include"
// ─────────────────────────────────────────────────────────────

/**
 * 1. Start Mock Interview
 * Sends sourceReportId or jobDescription along with optional resume, selfDescription, roleTitle.
 * Response: { mockInterview: session }
 */
export const startMockInterview = async ({
  sourceReportId = null,
  jobDescription = "",
  roleTitle = "",
  resume = "",
  selfDescription = "",
  questionCount = 16,
  secondsPerQuestion = 30,
} = {}) => {
  try {
    const payload = {
      roleTitle,
      resume,
      selfDescription,
      questionCount: Number(questionCount) || 16,
      secondsPerQuestion: Number(secondsPerQuestion) || 30,
    };

    if (sourceReportId) {
      payload.sourceReportId = sourceReportId;
    }
    if (jobDescription) {
      payload.jobDescription = jobDescription;
    }

    const response = await api.post("/interview/mock", payload);
    return response.data;
  } catch (error) {
    console.error("Error starting mock interview session:", error?.response?.data || error.message);
    throw error;
  }
};

/**
 * 2. Get Mock Interview Session by ID (Page Refresh & Session Restore)
 * Response: { mockInterview: session }
 */
export const getMockInterview = async (sessionId) => {
  try {
    const response = await api.get(`/interview/mock/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error loading mock interview session ${sessionId}:`, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * 3. Submit Mock Interview Answer, Skip, or Timeout
 * status: "answered" | "skipped" | "timed_out"
 * Response: { evaluation, status, nextQuestionIndex, isComplete }
 */
export const submitMockInterviewAnswer = async (
  sessionId,
  { questionIndex, answer = "", status = "answered", timeSpentSeconds = 0 }
) => {
  try {
    const response = await api.post(`/interview/mock/${sessionId}/answer`, {
      questionIndex,
      answer,
      status,
      timeSpentSeconds,
    });
    return response.data;
  } catch (error) {
    console.error(`Error submitting answer for question ${questionIndex}:`, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * 4. Complete Mock Interview and Generate Performance Preparation Report
 * Response: { mockInterview: completedSession }
 */
export const completeMockInterview = async (sessionId) => {
  try {
    const response = await api.post(`/interview/mock/${sessionId}/complete`);
    return response.data;
  } catch (error) {
    console.error(`Error completing mock interview ${sessionId}:`, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * 5. Get Mock Interview History
 * Response: { mockInterviews: [...] }
 */
export const getMockInterviewHistory = async () => {
  try {
    const response = await api.get("/interview/mock");
    return response.data;
  } catch (error) {
    console.error("Error fetching mock interview history:", error?.response?.data || error.message);
    throw error;
  }
};
