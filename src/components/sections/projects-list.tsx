"use client";

import { useState, useMemo } from "react";
import { ProjectCard } from "./project-card";
import { SearchFilterGroup, type SortOption } from "@/components/ui/filter-group";
import type { Projects } from "#site/content";

type ProjectCategoryValue = "featured" | "frontend" | "fullstack" | "cli";

const projectCategoryOptions = [
  { label: "Featured", value: "featured" },
  { label: "Frontend", value: "frontend" },
  { label: "Fullstack", value: "fullstack" },
  { label: "CLI Tools", value: "cli" },
] as const;

type ProjectsListProps = {
  projects: Projects[];
};

export function ProjectsList({ projects }: ProjectsListProps) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ProjectCategoryValue[]>([]);
  const [sort, setSort] = useState<SortOption>("latest");

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.excerpt.toLowerCase().includes(searchLower) ||
          p.tech.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Filter by categories (multi-select, empty = all)
    if (categories.length > 0) {
      const hasFeatured = categories.includes("featured");
      const otherCategories = categories.filter((c) => c !== "featured");

      result = result.filter((p) => {
        const matchesFeatured = hasFeatured && p.featured > 0;
        const matchesCategory = (otherCategories as string[]).includes(p.category);
        return matchesFeatured || matchesCategory;
      });
    }

    // Sort
    switch (sort) {
      case "latest":
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [projects, search, categories, sort]);

  const projectsByYear = useMemo(() => {
    if (sort === "name-asc" || sort === "name-desc") {
      return null;
    }

    return filteredAndSortedProjects.reduce(
      (acc, p) => {
        const year = new Date(p.date).getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(p);
        return acc;
      },
      {} as Record<string, Projects[]>
    );
  }, [filteredAndSortedProjects, sort]);

  const years = projectsByYear
    ? Object.keys(projectsByYear).sort((a, b) =>
        sort === "oldest" ? +a - +b : +b - +a
      )
    : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
        <h1 className="font-semibold text-xl md:text-2xl">Projects</h1>
        <SearchFilterGroup
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          onCategoriesChange={setCategories}
          sort={sort}
          onSortChange={setSort}
          categoryOptions={projectCategoryOptions}
        />
      </div>

      <div className="flex flex-col mt-4 gap-6">
        {filteredAndSortedProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No projects found.
          </p>
        ) : years && projectsByYear ? (
          years.map((year) => (
            <div key={year}>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {year}
              </p>
              <div className="flex flex-col">
                {projectsByYear[year].map((p) => (
                  <ProjectCard
                    key={p.slugAsParams}
                    name={p.title}
                    url={p.url}
                    date={p.date}
                    description={p.excerpt}
                    github={p.github}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col">
            {filteredAndSortedProjects.map((p) => (
              <ProjectCard
                key={p.slugAsParams}
                name={p.title}
                url={p.url}
                date={p.date}
                description={p.excerpt}
                github={p.github}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
