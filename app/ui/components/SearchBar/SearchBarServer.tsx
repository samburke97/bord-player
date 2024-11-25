"use server";

import fetchTags from "@/app/lib/data/tags/fetchTags";
import fetchSports from "@/app/lib/data/sports/fetchSports";
import fetchCenters from "@/app/lib/data/centers/fetchCenters";
import fetchGroups from "@/app/lib/data/groups/fetchGroups";

export async function fetchSearchResults(query: string) {
  if (query.length < 2) return [];

  const [tags, sports, centers, groups] = await Promise.all([
    fetchTags(),
    fetchSports(),
    fetchCenters(),
    fetchGroups(),
  ]);

  const results = [
    { type: "search", name: `Search for "${query}"`, id: "search-option" },
    ...tags
      .filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()))
      .map((tag) => ({
        type: "tag",
        name: tag.name,
        id: tag.id,
      })),
    ...sports
      .filter((sport) => sport.name.toLowerCase().includes(query.toLowerCase()))
      .map((sport) => ({
        type: "sport",
        name: sport.name,
        id: sport.id,
      })),
    ...centers
      .filter((center) =>
        center.name.toLowerCase().includes(query.toLowerCase())
      )
      .map((center) => ({
        type: "center",
        name: center.name,
        id: center.id,
      })),
    ...groups
      .filter((group) => group.name.toLowerCase().includes(query.toLowerCase()))
      .map((group) => ({
        type: "group",
        name: group.name,
        id: group.id,
      })),
  ];

  return results.slice(0, 4);
}
