// src/app/seeder/propertyTypesSeeder.ts

import { PropertyTypes } from "../../modules/propertyElements/propertyElement.model";

export const seedPropertyTypes = async () => {
  const data = {
    accessTypes: [
      "students",
      "families",
      "single",
      "couple",
      "unemployed",
      "smoker",
      "professional",
      "pet-friendly",
      "senior-citizens",
    ],
    featureTypes: [
      "billsIncluded",
      "parking",
      "garden",
      "aircon",
      "gym",
      "studio",
      "shops",
      "garage",
      "balcony",
      "pool",
      "security",
    ],
    propertyTypes: [
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/a93597fa-4bf3-49c2-a6db-53126460e065-home.svg",
        title: "Home",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/db342a6e-c4bd-42d9-bdae-41d20e13ca38-Bungalow.svg",
        title: "Bungalow",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/19abc39a-87ec-4926-8fd1-2d58438c9982-Flat.svg",
        title: "Flat",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/83609ac2-ea8e-4108-b192-5b820b3e8bbe-Boys%20Quatres.svg",
        title: "Boys Quatres",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/ec9e49db-1a77-443d-a6bd-9fe99f390caf-Studio%20Room.svg",
        title: "Studio Room",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/b5b6e32c-28b5-49b0-94b9-be102ec8f848-Boat%20House.svg",
        title: "Boat House",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/c5aa8ab5-a694-4011-96f7-edf35f56010a-Duplex.svg",
        title: "Duplex",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/d986988f-8c3b-46fd-9f40-4d7bcb848bbc-Events%20Hall.svg",
        title: "Events Hall",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/38bf34ba-a0bc-4352-bf4f-e7b74dbade7a-Office.svg",
        title: "Office",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/048fd246-02cc-43bd-9478-83d495a189cb-Rooms.svg",
        title: "Rooms",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/8fcc491d-7039-4c65-b1ec-20ef670736b4-Shops.svg",
        title: "Shops",
      },
      {
        icon: "https://simplerooms.sfo3.digitaloceanspaces.com/6ecc2dfe-8587-45cd-aa6d-7d455b108b00-Warehouses.svg",
        title: "Warehouses",
      },
    ]
  };

  const existing = await PropertyTypes.findOne();
  if (!existing) {
    await PropertyTypes.create(data);
    console.log("🚀 PropertyTypes seeded successfully");
  }
  //  else {
  //   await PropertyTypes.updateOne({ _id: existing._id }, data);
  //   console.log("✅ PropertyTypes updated successfully");
  // }
};
