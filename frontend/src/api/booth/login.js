import { apiClient } from "../../api-client";

const applicableUsers = [
  {
    venue: "Esplanade Train Station",
    launch: "venue1",
    userName: "esplanadeStation",
    password: "Esplanade@Wellstation8032025",
  },
  {
    venue: "SMU University",
    userName: "smu",
    password: "SMU@WellStation10032025",
    launch: "venue2",
  },
  {
    venue: "collab",
    userName: "collab",
    password: "Collab@WellStation26032025",
    launch: "venue3",
  },
  {
    venue: "astar_central",
    userName: "astarcentral",
    password: "astarCentral@WellStation26032025",
    launch: "venue4",
  },
];

export const mockLoginApi = async ({ username, password }) => {
  // Find the user in the applicableUsers array
  const user = applicableUsers.find(
    (user) => user.userName === username && user.password === password
  );

  // Return success with user data if found, error if not
  if (user) {
    return {
      success: true,
      data: {
        venue: user.venue,
        username: user.userName,
        launch: user.launch,
      },
      message: "Login successful",
    };
  } else {
    return {
      success: false,
      data: null,
      message: "Invalid username or password",
    };
  }
};

export const loginToBoothUi = async (data) => {
  try {
    const response = await apiClient.get("/booth/fetch/locations");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
