import { useContext } from "react";
import { InterviewContext } from "../interview.context";
import {
  genrateInterviewReport,
  getAllInterviewReports,
  getInterviewReport,
} from "../services/interview.api";

export const useInterview = () => {
  const { loading, setLoading, report, setReport, reports, setReports } =
    useContext(InterviewContext);

  const creatInterviewreport = async ({
    selfDescription,
    jobDescription,
    resume,
  }) => {
    try {
      setLoading(true);
      const data = await genrateInterviewReport({
        selfDescription,
        jobDescription,
        resume,
      });
      setReport(data.interviewReport || data);
      return data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getInterviewReportById = async (reportId) => {
    try {
      setLoading(true);
      const data = await getInterviewReport(reportId);
      setReport(data.interviewReport || data);
      return data;
    } catch (error) {
      console.error("Error getting report by id:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllInterviewReport = async () => {
    try {
      setLoading(true);
      const data = await getAllInterviewReports();
      const reportList = Array.isArray(data)
        ? data
        : (data?.interviewReport || data?.interviewReports || data?.reports || data?.data || []);
      setReports(Array.isArray(reportList) ? reportList : []);
      return reportList;
    } catch (error) {
      console.error("Error fetching all reports:", error);
      setReports([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    creatInterviewreport,
    getInterviewReportById,
    getAllInterviewReport,
    loading,
    setLoading,
    report,
    setReport,
    reports,
    setReports,
  };
};
