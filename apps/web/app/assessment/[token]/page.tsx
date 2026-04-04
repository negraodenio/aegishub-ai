import { WorkerWizard } from "../../../features/assessment/components/WorkerWizard";

export default async function WorkerAssessmentPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  // In a real application, we would decode or verify the 'token' against the DB
  // to ensure its validity and extract the 'company_id' or 'department_id'.
  // We can inject SSR validation logic here.

  return (
    <>
      <WorkerWizard token={params.token} />
    </>
  );
}
