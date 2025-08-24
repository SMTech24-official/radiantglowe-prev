import fs from "fs";
import { Page } from "../../modules/cms/page.model";
import path from "path";
import { fileURLToPath } from "url";
import { cmsData } from "./data/cmsData";

export const seedCMS = async () => {
    // Use CommonJS __dirname if available, otherwise fallback
    // const __dirname = path.resolve();

    // const dataPath = path.join(__dirname, "data/cms.json");
    // const rawData = fs.readFileSync(dataPath, "utf-8");
    // const seedData = JSON.parse(rawData);
    try {
        for (const item of cmsData) {
            const exists = await Page.findOne({ pageName: item.pageName });

            if (!exists) {
                await Page.create(item);
                console.log(`🚀 Created page content: ${item.pageName}`);
            } 
            // else {
            //     await Page.updateOne({ pageName: item.pageName }, item);
            //     console.log(`✅ Updated page content: ${item.pageName}`);
            // }
        }
        console.log("🎉 All content seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding content:", error);
    }
};
