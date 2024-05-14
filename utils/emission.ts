import {roundCo2Amount} from "./calculate"

export class EmissionCalculator {
    profile: Profile.Profile
    mobility: Profile.EmissionResult[]
    food: Profile.EmissionResult[]
    housing: Profile.EmissionResult[]
    other: Profile.EmissionResult[]

    constructor(profile: Profile.Profile) {
        this.profile = profile;
        this.calculateAllEmissions();
    }

    uniq<T>(array: T[]): T[] {
        const knownElements = new Set<T>();
        array.forEach(elem => knownElements.add(elem));
        return Array.from(knownElements);
    }

    calculateAllEmissions() {
        this.mobility = this.calcEmission('mobility');
        this.food = this.calcEmission('food');
        this.housing = this.calcEmission('housing');
        this.other = this.calcEmission('other');
    }

    calcEmission(category: Profile.QuestionCategory): Profile.EmissionResult[] {
        if (!this.profile) return [];

        const result: Profile.EmissionResult[] = [];
        const categoryEstimations = this.profile.estimations.filter(e => e.domain === category);
        const categoryBaselines = this.profile.baselines.filter(b => b.domain === category);

        const subdomains = this.uniq(categoryBaselines.map(cb => cb.subdomain));

        for (const subdomain of subdomains) {
            const current = {key: subdomain, value: 0};
            result.push(current);

            const subdomainItems = this.uniq(
                categoryEstimations.concat(categoryBaselines)
                    .filter(ce => ce.subdomain === subdomain)
                    .map(si => si.item)
            );

            for (const item of subdomainItems) {
                let amount = categoryEstimations.find(ce => ce.domain === category && ce.item === item && ce.type === 'amount')?.value || 0;
                let intensity = categoryBaselines.find(bl => bl.domain === category && bl.item === item && bl.type === 'intensity')?.value || 0;
                let emission = Number(amount) * Number(intensity);
                current.value += emission;
            }
        }

        const totalEmission = result.reduce((total, e) => total + e.value, 0);
        result.push({key: 'total', value: roundCo2Amount(totalEmission)});
        result.push({key: 'monthly', value: Math.round(roundCo2Amount(totalEmission) / 12)});

        return result;
    }
}
