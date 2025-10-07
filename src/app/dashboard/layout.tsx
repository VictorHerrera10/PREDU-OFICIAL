import withAuth from "@/components/with-auth";

function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  }
  
  export default withAuth(DashboardLayout);