"""
Microbial Evolution Simulation Engine - Interactive Virtual Lab Edition.
"""
import uuid
import random
import numpy as np

SPECIES_PROFILES = {
    "ecoli": {"label": "E. coli", "base_growth": 0.32, "base_mutation": 0.01},
    "mrsa": {"label": "MRSA", "base_growth": 0.22, "base_mutation": 0.02},
    "pseudomonas": {"label": "Pseudomonas", "base_growth": 0.27, "base_mutation": 0.015},
}

SUSCEPTIBLE, INTERMEDIATE, RESISTANT, HIGHLY_RESISTANT = 0, 1, 2, 3


def classify(resistance):
    if resistance < 0.25:
        return SUSCEPTIBLE
    if resistance < 0.50:
        return INTERMEDIATE
    if resistance < 0.75:
        return RESISTANT
    return HIGHLY_RESISTANT


class Cell:
    __slots__ = ("x", "y", "resistance", "alive", "mutations")

    def __init__(self, x, y, resistance, mutations=0):
        self.x = x
        self.y = y
        self.resistance = resistance
        self.alive = True
        self.mutations = mutations


class SimulationEngine:
    def __init__(
        self,
        species="ecoli",
        grid_size=40,
        initial_population=120,
        mutation_rate=0.05,
        mutation_strength=0.1,
        antibiotic_level=0.5,
        growth_rate=0.3,
        simulation_speed=1.0,
    ):
        self.id = str(uuid.uuid4())
        self.species = species if species in SPECIES_PROFILES else "ecoli"
        profile = SPECIES_PROFILES[self.species]

        self.grid_size = int(grid_size)
        self.mutation_rate = float(mutation_rate)
        self.mutation_strength = float(mutation_strength) * 4.0 
        
        self.antibiotic_level = float(antibiotic_level)
        self.growth_rate = float(growth_rate) if growth_rate else profile["base_growth"]
        self.simulation_speed = float(simulation_speed)

        self.generation = 0
        self.mutation_count = 0
        self.death_count = 0
        self.history = []
        self.interventions_log = [] # Tracks manual lab actions

        self.antibiotic_field = self._init_antibiotic_field()
        self.cells = []
        self.max_population = max(int(initial_population) * 12, 800)
        
        occupied = set()
        while len(self.cells) < int(initial_population) and len(occupied) < self.grid_size**2:
            x = random.randint(0, self.grid_size - 1)
            y = random.randint(0, self.grid_size - 1)
            if (x, y) not in occupied:
                occupied.add((x, y))
                self.cells.append(Cell(x, y, random.uniform(0.0, 0.10)))

        self.running = False

    def _init_antibiotic_field(self):
        size = self.grid_size
        yy, xx = np.mgrid[0:size, 0:size]
        cx, cy = size / 2, size / 2
        dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (size / 2)
        field = self.antibiotic_level * np.clip(1.0 - dist * 0.6, 0.1, 1.0)
        return field

    def apply_treatment(self, intensity, center_x=None, center_y=None, drug_name="Custom Treatment"):
        """
        LAB FEATURE: Allows the user to drop a targeted antibiotic disk 
        or change drug concentration anywhere on the grid mid-simulation.
        """
        intensity = float(intensity)
        size = self.grid_size
        
        if center_x is None or center_y is None:
            cx, cy = size / 2, size / 2
        else:
            cx, cy = float(center_x), float(center_y)

        yy, xx = np.mgrid[0:size, 0:size]
        dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (size / 2)
        
        # Create a localized diffusion gradient ring (Kirby-Bauer simulation)
        new_pocket = intensity * np.clip(1.0 - dist * 0.8, 0.0, 1.0)
        
        # Blend with current antibiotic field
        self.antibiotic_field = np.clip(self.antibiotic_field + new_pocket, 0.0, 1.0)
        
        self.interventions_log.append({
            "generation": self.generation,
            "action": "apply_treatment",
            "drug": drug_name,
            "intensity": intensity,
            "coordinates": (cx, cy)
        })
        return self.get_state()

    def wash_plate(self):
        """
        LAB FEATURE: Flush or wash the petri dish to clear out antibiotic pressure 
        and check non-resistance / recovery levels of surviving cells.
        """
        self.antibiotic_field = self.antibiotic_field * 0.2 # Reduce drug concentration significantly
        self.interventions_log.append({
            "generation": self.generation,
            "action": "wash_plate",
            "description": "Buffer wash applied to reduce local antimicrobial concentration."
        })
        return self.get_state()

    def _diffuse_antibiotic(self):
        kernel_sum = (
            np.roll(self.antibiotic_field, 1, axis=0)
            + np.roll(self.antibiotic_field, -1, axis=0)
            + np.roll(self.antibiotic_field, 1, axis=1)
            + np.roll(self.antibiotic_field, -1, axis=1)
        )
        self.antibiotic_field = 0.5 * self.antibiotic_field + 0.125 * kernel_sum
        # Allow natural decay if unforced, keeping baseline flexible for lab resets
        self.antibiotic_field = np.clip(self.antibiotic_field, 0.1, 1.0)

    def step(self):
        self.generation += 1
        self._diffuse_antibiotic()

        survivors = []
        occupied = set()
        deaths_this_gen = 0
        mutations_this_gen = 0

        for cell in self.cells:
            if not cell.alive:
                continue

            local_ab = float(self.antibiotic_field[cell.y, cell.x])
            survival_chance = 1.0 - max(0.0, local_ab - cell.resistance)

            if random.random() > survival_chance:
                cell.alive = False
                deaths_this_gen += 1
                continue

            if (cell.x, cell.y) not in occupied:
                occupied.add((cell.x, cell.y))
                survivors.append(cell)
            else:
                deaths_this_gen += 1

        new_cells = []
        for cell in survivors:
            new_cells.append(cell)
            
            if random.random() < self.growth_rate and len(new_cells) < self.max_population:
                neighbors = [
                    (cell.x + dx, cell.y + dy)
                    for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                    if not (dx == 0 and dy == 0)
                ]
                random.shuffle(neighbors)
                
                for nx, ny in neighbors:
                    if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size:
                        if (nx, ny) not in occupied:
                            child_resistance = cell.resistance
                            child_mutations = cell.mutations
                            
                            if random.random() < (self.mutation_rate * 3.0):
                                delta = random.uniform(0.1, 0.8) * self.mutation_strength
                                child_resistance = float(np.clip(cell.resistance + delta, 0, 1))
                                child_mutations += 1
                                mutations_this_gen += 1
                            
                            occupied.add((nx, ny))
                            new_cells.append(Cell(nx, ny, child_resistance, child_mutations))
                            break

        self.cells = new_cells
        self.death_count += deaths_this_gen
        self.mutation_count += mutations_this_gen

        snapshot = self._build_snapshot(deaths_this_gen, mutations_this_gen)
        self.history.append(snapshot)
        return snapshot

    def _build_snapshot(self, deaths_this_gen, mutations_this_gen):
        population = len(self.cells)
        if population > 0:
            resistances = np.array([c.resistance for c in self.cells])
            avg_resistance = float(resistances.mean())
            resistant_frac = float((resistances >= 0.75).mean())
        else:
            avg_resistance = 0.0
            resistant_frac = 0.0

        survival_rate = 1.0 - (
            deaths_this_gen / max(1, deaths_this_gen + population)
        )

        hotspot_count = self._count_hotspots()

        return {
            "generation": self.generation,
            "population": population,
            "avg_resistance": round(avg_resistance, 4),
            "resistant_fraction": round(resistant_frac, 4),
            "deaths": deaths_this_gen,
            "mutations": mutations_this_gen,
            "cumulative_deaths": self.death_count,
            "cumulative_mutations": self.mutation_count,
            "survival_rate": round(survival_rate, 4),
            "hotspot_count": hotspot_count,
            "dominant_colony": classify(avg_resistance),
        }

    def _count_hotspots(self):
        threshold = 0.6
        grid = np.zeros((self.grid_size, self.grid_size))
        for c in self.cells:
            if c.resistance >= 0.75:
                grid[c.y, c.x] += 1
        hot = (self.antibiotic_field > threshold) & (grid > 0)
        return int(hot.sum())

    def get_cells_payload(self):
        return [
            {
                "id": idx + 1,
                "x": c.x,
                "y": c.y,
                "r": round(c.resistance, 3),
                "cls": classify(c.resistance),
                "alive": True,
                "generation_born": self.generation,
                "mutation_count": c.mutations,
                "growth_rate": round(self.growth_rate, 3),
                "parent_id": None,
            }
            for idx, c in enumerate(self.cells)
        ]

    def get_antibiotic_field_payload(self, downsample=1):
        field = self.antibiotic_field
        if downsample > 1:
            field = field[::downsample, ::downsample]
        return np.round(field, 3).tolist()

    def get_state(self):
        latest = self.history[-1] if self.history else self._build_snapshot(0, 0)
        return {
            "id": self.id,
            "species": self.species,
            "grid_size": self.grid_size,
            "generation": self.generation,
            "cells": self.get_cells_payload(),
            "antibiotic_field": self.get_antibiotic_field_payload(downsample=2),
            "stats": latest,
            "interventions_log": self.interventions_log,
        }

    def config_metadata(self):
        return {
            "species": self.species,
            "grid_size": self.grid_size,
            "mutation_rate": self.mutation_rate,
            "mutation_strength": self.mutation_strength,
            "antibiotic_level": self.antibiotic_level,
            "growth_rate": self.growth_rate,
            "simulation_speed": self.simulation_speed,
        }