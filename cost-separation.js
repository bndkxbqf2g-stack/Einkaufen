;(function attachCostSeparationModel(root) {
  'use strict';

  function normalizeCents(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  function category(value, statusWhenKnown) {
    const cents = normalizeCents(value);
    return { cents, status: cents === null ? 'unknown' : statusWhenKnown };
  }

  function summarizeCostSeparation(input) {
    const source = input && typeof input === 'object' ? input : {};
    const cashRegister = category(source.cashRegisterCents, 'confirmed');
    const consumption = category(source.consumptionCostCents, 'confirmed');
    const travel = category(source.travelCostCents, 'separate');
    const operatingCents = cashRegister.cents === null || consumption.cents === null
      ? null
      : cashRegister.cents + consumption.cents;
    const totalWithTravelCents = operatingCents === null || travel.cents === null
      ? null
      : operatingCents + travel.cents;
    return Object.freeze({
      cashRegisterCents: cashRegister.cents,
      cashRegisterStatus: cashRegister.status,
      consumptionCostCents: consumption.cents,
      consumptionCostStatus: consumption.status,
      travelCostCents: travel.cents,
      travelCostStatus: travel.status,
      operatingCents,
      operatingStatus: operatingCents === null ? 'unknown' : 'confirmed',
      totalWithTravelCents,
      totalWithTravelStatus: totalWithTravelCents === null ? 'unknown' : 'confirmed',
    });
  }

  root.AngebotskuecheCostSeparationModel = Object.freeze({
    normalizeCents,
    summarizeCostSeparation,
  });
}(typeof window !== 'undefined' ? window : globalThis));
