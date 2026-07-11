import { useCallback, useMemo, useState } from "react";

export function useAuthForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const errors = useMemo(() => validate(values), [validate, values]);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setStatus(null);
  }, []);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const errorFor = useCallback(
    (name) => (submitAttempted || touched[name] ? errors[name] || "" : ""),
    [errors, submitAttempted, touched]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitAttempted(true);
      setStatus(null);
      setTouched((prev) => ({
        ...prev,
        ...Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      }));

      if (Object.keys(errors).length > 0) {
        setStatus({ type: "error", message: "Please fix the highlighted fields and try again." });
        return;
      }

      try {
        setIsSubmitting(true);
        const result = await onSubmit(values);
        setStatus({
          type: "success",
          message: result?.message || "Request completed successfully."
        });
      } catch (error) {
        setStatus({
          type: "error",
          message: error?.message || "Something went wrong. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [errors, onSubmit, values]
  );

  return {
    values,
    errors,
    status,
    isSubmitting,
    handleChange,
    handleBlur,
    errorFor,
    handleSubmit
  };
}
