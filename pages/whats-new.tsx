import React from "react";
import Head from "next/head";
import Footer from "components/Footer";
import HomeHeader from "components/HomeHeader";

export default function WhatsNew() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>{`What's New | BirdPlan.app`}</title>
      </Head>

      <HomeHeader />
      <main className="container px-4">
        <h1 className="text-4xl text-gray-800 leading-normal font-bold mt-12">What&apos;s New</h1>
        <div className="prose prose-h2:text-gray-800 prose-h2:mt-12 prose-ul:list-none prose-ul:pl-4 mb-12">
          <h2>January 3, 2025</h2>
          <ul>
            <li>
              ✨ Improved loading of hotspot targets from eBird. The process will now continue even if the hotspot
              window is closed.
            </li>
          </ul>
          <h2>September 4, 2024</h2>
          <ul>
            <li>🐞 Fixed several user interface bugs on mobile devices.</li>
            <li>🐞 Fixed bug where KML exports were not displaying descriptions correctly for certain places.</li>
            <li>🐞 Made saved hotspots easier to click than surrounding markers on map.</li>
          </ul>
          <h2>June 4, 2024</h2>
          <ul>
            <li>
              ✨ The auto importing of target species from eBird has been expanded to include hotspots. Once you save a
              hotspot to your trip, the target species will be automatically imported. Make sure you leave the hotspot
              window open for this to complete.
            </li>
          </ul>
          <h2>June 2, 2024</h2>
          <ul>
            <li>
              ✨ Target species are now automatically imported from eBird! You no longer have to manually upload a CSV
              file. The same functionality will soon be brought over to hotspots targets.
            </li>
            <li>🐞 Fixed bug where opening map from target list would sometimes not be fully visible.</li>
          </ul>
          <h2>May 24, 2024</h2>
          <ul>
            <li>✨ Redesigned trip targets page.</li>
            <li>✨ Trip targets can now be starred. Useful for indicating endemic or near endemic species.</li>
          </ul>
          <h2>March 12, 2024</h2>
          <ul>
            <li>✨ Added a trip settings page.</li>
            <li>✨ Added a bunch of new icons to choose from when adding a new marker.</li>
            <li>
              ✨ KML Export: Added a link to Google Maps when viewing a marker in other apps such as Organic Maps.
            </li>
          </ul>
          <h2>March 9, 2024</h2>
          <ul>
            <li>✨ Highlight selected marker on the map.</li>
            <li>✨ Added new trip photo quiz feature (accessed from the 3 dots dropdown menu).</li>
            <li>
              ✨ Easily add a place from Google Maps such as airports, hotels, and restaurants by searching for the
              place.
            </li>
            <li>
              ✨ Redesigned map interface by removing the sidebar and adding several icons to handle map functions.
            </li>
          </ul>
          <h2>February 24, 2024</h2>
          <ul>
            <li>🐞 Allow adding multiple of the same location on an itinerary day without it breaking.</li>
            <li>🐞 Several other bug fixes related to itineraries.</li>
          </ul>
          <h2>February 5, 2024</h2>
          <ul>
            <li>✨ Added option to list exceptions when uploading life list.</li>
          </ul>
          <h2>December 17, 2023</h2>
          <ul>
            <li>✨ Redesigned trip targets page.</li>
            <li>✨ Link to Merlin (on mobile) and eBird species page (on computer) from targets.</li>
          </ul>
          <h2>December 13, 2023</h2>
          <ul>
            <li>🐞 Include favorites species in hotspot description of KML export.</li>
          </ul>
          <h2>December 10, 2023</h2>
          <ul>
            <li>🐞 Fix error when accessing eBird hotspot data.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
