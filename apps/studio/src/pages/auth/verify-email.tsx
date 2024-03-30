import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";

import Loading from "@/components/loading";
import { api } from "@/lib/utils";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmail = useCallback(async () => {
    try {
      await api.post(`/auth/v1/verify-email/${token}`);
      navigate(0);
    } catch (error: AxiosError | Error | any) {
      if (error instanceof AxiosError) {
        navigate(`/auth/message?message=${error.response?.data.message}`);
      } else {
        navigate(`/auth/message?message=${error.message || "Failed to confirm signup"}`);
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return <Loading />;
}
