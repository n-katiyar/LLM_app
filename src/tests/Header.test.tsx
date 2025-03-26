import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { NavigationContext } from "../../src/context/NavigationContext";
// import { NavigationContext } from "@/context/NavigationContext";
import { Header } from "../../src/components/common/Header";
// import { Header } from "@/components/common/Header";

const theme = createTheme();

test("renders the Lumada App text", () => {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <NavigationContext.Provider value={{ activePath: { id: "home" } }}>
          <Header />
        </NavigationContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  );

  expect(screen.getByText("Lumada App")).toBeInTheDocument();
});
