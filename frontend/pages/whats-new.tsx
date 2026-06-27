import React from "react";
import Footer from "components/Footer";
import HomeHeader from "components/HomeHeader";
import { Link } from "react-router-dom";

export default function WhatsNew() {
  return (
    <div className="flex flex-col h-full">
      <title>What&apos;s New | BirdPlan.app</title>

      <HomeHeader />
      <main className="container px-4">
        <h1 className="text-4xl text-gray-800 leading-normal font-bold mt-12">What&apos;s New</h1>
        <div className="prose prose-h2:text-gray-800 prose-h2:mt-12 prose-ul:list-none prose-ul:pl-4 mb-12">
          <h2>June 26, 2026</h2>
          <ul>
            <li>
              💅 <strong>A fresh look for several pages.</strong> We&apos;ve redesigned a number of pages for a cleaner,
              more consistent experience, including the <strong>create trip</strong>, <strong>trip settings</strong>,{" "}
              <strong>participants</strong>, <strong>account</strong>, <strong>import life list</strong>, and{" "}
              <strong>trips</strong> pages.
            </li>
            <li>🐞 You can now select subregions for all countries when creating a trip.</li>
          </ul>
          <h2>June 24, 2026</h2>
          <ul>
            <li>
              🔑 <strong>Sign in with Google has been removed.</strong> We&apos;ve switched to a simpler email sign-in:
              enter your email and we&apos;ll send you a one-time code. This streamlines our authentication and reduces
              our reliance on external services. To get back in, just use the same email address you signed up with.
            </li>
          </ul>
          <h2>June 19, 2026</h2>
          <ul>
            <li>
              🎉 <strong>Group trips got a major overhaul.</strong> Everyone on a trip now has their own life list, and
              BirdPlan tracks targets for the whole group.
            </li>
            <li>
              ✨ <strong>Mutual targets</strong> highlight the species that <em>everyone</em> in your group still needs,
              flagged with a badge across your targets and species pages, so you can prioritize the stops that get the
              whole group a lifer.
            </li>
            <li>
              ✨ Switch between <strong>Group and Personal targets</strong> at any time to see what the whole group
              needs versus just your own.
            </li>
            <li>
              ✨ Use a <strong>custom life list</strong> for a single trip instead of your world life list, handy when
              your trip needs differ from your overall list.
            </li>
            <li>✨ A smoother trip creation, invite, and onboarding flow throughout.</li>
            <li>🐞 Improved the frequency bar chart on target species pages.</li>
          </ul>
          <h2>June 11, 2026</h2>
          <ul>
            <li>
              ✨ You can now send a trip to the{" "}
              <a href="https://openbirding.org" target="_blank" rel="noreferrer">
                OpenBirding
              </a>{" "}
              app from the trip options menu.
            </li>
          </ul>
          <h2>June 9, 2026</h2>
          <ul>
            <li>
              ✨ The top hotspots on a target species page now show all-year data by default, with a dropdown to switch
              between all year and your trip&apos;s month range.
            </li>
          </ul>
          <h2>May 5, 2026</h2>
          <ul>
            <li>✨ Existing trips can now have their region updated from the trip settings page.</li>
            <li>🐞 Fixed an issue where recent species reports at hotspots could be missing.</li>
          </ul>
          <h2>May 4, 2026</h2>
          <ul>
            <li>
              ✨ New target species pages with ranked hotspots, filters for recent activity and frequency, and monthly
              charts.
            </li>
          </ul>
          <h2>March 26, 2026</h2>
          <ul>
            <li>✨ Updated custom marker icons with new fuel and camera options, and removed less useful icons.</li>
          </ul>
          <h2>March 25, 2026</h2>
          <ul>
            <li>
              ✨ Target species now load significantly faster, powered by{" "}
              <a href="https://openbirding.org" target="_blank" rel="noreferrer">
                OpenBirding.org
              </a>
              .
            </li>
            <li>🐞 Fixed a bug where adding days to the itinerary would display duplicate days.</li>
          </ul>
          <h2>December 17, 2025</h2>
          <ul>
            <li>✨ Updated to the latest version of Avicommons.org data for species thumbnails.</li>
          </ul>
          <h2>November 4, 2025</h2>
          <ul>
            <li>
              🐞 Fixed issue where hotspots with more than 500 species were not displaying in the correct color on the
              map.
            </li>
          </ul>
          <h2>July 17, 2025</h2>
          <ul>
            <li>✨ Minor improvements to the hotspot modal.</li>
          </ul>
          <h2>June 25, 2025</h2>
          <ul>
            <li>✨ Added ability to edit custom markers.</li>
          </ul>
          <h2>June 17, 2025</h2>
          <ul>
            <li>🛠️ Migrated to a new backend. If you experience any issues, please let us know.</li>
          </ul>
          <h2>May 12, 2025</h2>
          <ul>
            <li>🐞 More changes to how time zones are handled to fix occasional errors when creating trips.</li>
          </ul>
          <h2>May 1, 2025</h2>
          <ul>
            <li>🐞 Fixed a bug where the time zone was not being detected correctly for some regions.</li>
          </ul>
          <h2>April 27, 2025</h2>
          <ul>
            <li>
              ✨ Added a <Link to="/contact">support page</Link> with a contact form.
            </li>
          </ul>
          <h2>April 17, 2025</h2>
          <ul>
            <li>
              ✨ Added ability to change your password and email from the account settings page (if you signed up with
              email and password).
            </li>
          </ul>
          <h2>April 13, 2025</h2>
          <ul>
            <li>✨ Added ability to sign up with email and password (previously only Google Sign In was available).</li>
          </ul>
          <h2>April 4, 2025</h2>
          <ul>
            <li>✨ Added feature for deleting your account.</li>
          </ul>
          <h2>March 26, 2025</h2>
          <ul>
            <li>🐞 Fixed a bug where some eBird data was not loading.</li>
          </ul>
          <h2>March 24, 2025</h2>
          <ul>
            <li>✨ Improved interface for managing life list exceptions.</li>
          </ul>
          <h2>March 18, 2025</h2>
          <ul>
            <li>✨ Improved error handling in the hotspot dialog.</li>
          </ul>
          <h2>March 16, 2025</h2>
          <ul>
            <li>
              ✨ Editors can now invite other editors or remove themselves from a trip. They cannot remove the person
              who initially created the trip.
            </li>
          </ul>
          <h2>March 14, 2025</h2>
          <ul>
            <li>✨ New logo and a slight facelift as we get ready for a wider announcement.</li>
          </ul>
          <h2>March 13, 2025</h2>
          <ul>
            <li>
              ✨ Streamlined the process of importing region targets from eBird. You no longer need to choose a cutoff
              percent. All targets &gt; 0.01% will be included.
            </li>
            <li>✨ Optimized the process of downloading targets for hotspots.</li>
          </ul>
          <h2>March 12, 2025</h2>
          <ul>
            <li>
              🛠️ Switched to a new database provider and updated backend. If you experience any issues, please let us
              know.
            </li>
          </ul>
          <h2>February 18, 2025</h2>
          <ul>
            <li>🐞 Fixed a bug where clicking on a pin from the species map did not work.</li>
          </ul>
          <h2>January 16, 2025</h2>
          <ul>
            <li>
              ✨ When viewing trip targets, clicking the dropdown icon will now show a list of the best of your saved
              hotspots to find the species.
            </li>
          </ul>
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
