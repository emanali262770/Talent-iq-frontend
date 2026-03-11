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
      setReport(data.interviewReport);
        return data; 
    } catch (error) {
      console.log(error);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const getInterviewReportById = async (reportId) => {
    try {
      setLoading(true);
      const data = await getInterviewReport(reportId);
      setReport(data.interviewReport);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const getAllInterviewReport = async () => {
    try {
      setLoading(true);
      const data = await getAllInterviewReports();
      setReports(data.interviewReport || data.interviewReports || []);
    } catch (error) {
      console.log(error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  return{
    creatInterviewreport,
    getInterviewReportById,
    getAllInterviewReport,
    loading,
    report,
    reports
  }
};
