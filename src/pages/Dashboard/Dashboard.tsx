import {
  HvGrid,
  HvTypography,
  HvGlobalActions,
} from "@hitachivantara/uikit-react-core";


const Dashboard: React.FC = () => {

  return (
    <HvGrid container>
      <HvGrid item xs={12}>
        <HvTypography variant="title2">My Title</HvTypography>
      </HvGrid>
      <HvGrid item xs={12}>
        Some section
        {/* <HvGlobalActions title="My Section" variant="section" /> */}
      </HvGrid>
    </HvGrid>
  );
};

export default Dashboard;
