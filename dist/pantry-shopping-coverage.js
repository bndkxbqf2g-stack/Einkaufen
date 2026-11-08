;(function attachPantryShoppingCoverageModel(root) {
  'use strict';

  function sharedModels() {
    return {
      ingredient: root.AngebotskuecheIngredientModel,
      quantity: root.AngebotskuecheIngredientQuantityModel,
      pantry: root.AngebotskuechePantryQuantityModel,
    };
  }

  function parseDemand(item, quantityModel) {
    if (item?.manual === true) return null;
    const basis = item?.quantityBasis;
    if (!basis || basis.valid !== true || !basis.family || !basis.unit || !Number.isFinite(Number(basis.amount)) || Number(basis.amount) <= 0) return null;
    const parsed = quantityModel?.parseOfferPackSize?.(`${basis.amount} ${basis.unit}`);
    if (!parsed || parsed.family !== basis.family || !Number.isFinite(parsed.amount) || parsed.amount <= 0) return null;
    return parsed;
  }

  function aggregateDemand(entries, quantityModel) {
    const demands = entries.map(entry => parseDemand(entry.item, quantityModel));
    if (demands.some(demand => !demand)) return { status: 'unknown', demand: null, demands };
    const family = demands[0].family;
    if (demands.some(demand => demand.family !== family)) return { status: 'incompatible', demand: null, demands };
    const amount = demands.reduce((sum, demand) => sum + demand.amount, 0);
    if (!Number.isFinite(amount) || amount <= 0) return { status: 'unknown', demand: null, demands };
    return { status: 'known', demand: { family, unit: demands[0].unit, amount }, demands };
  }

  function legacyPosition(index, item) {
    return { index, name: String(item?.name || '').trim(), status: 'legacy' };
  }

  function summarizeShoppingPantryCoverage(items, pantryQuantities) {
    const list = Array.isArray(items) ? items : [];
    const { ingredient, quantity, pantry } = sharedModels();
    const identityOf = typeof ingredient?.shoppingIngredientIdentity === 'function'
      ? value => String(ingredient.shoppingIngredientIdentity(value) || '').trim()
      : () => '';
    const groups = new Map();
    const legacyPositions = [];
    list.forEach((item, index) => {
      const identity = identityOf(item?.name);
      const demand = parseDemand(item, quantity);
      if (!identity || !demand) {
        legacyPositions.push(legacyPosition(index, item));
        return;
      }
      const group = groups.get(identity) || { identity, name: String(item.name || '').trim(), entries: [] };
      group.entries.push({ index, item });
      groups.set(identity, group);
    });

    const coverageGroups = [...groups.values()].map(group => {
      const aggregated = aggregateDemand(group.entries, quantity);
      if (aggregated.status !== 'known') {
        return { identity: group.identity, name: group.name, indexes: group.entries.map(entry => entry.index), demand: null, coveredAmount: null, remainingDemand: null, status: aggregated.status };
      }
      const pantryDetail = pantry?.getQuantity?.(pantryQuantities, group.name) || null;
      const coverage = pantry?.reconcilePantryQuantity?.(aggregated.demand, pantryDetail) || {
        demand: aggregated.demand.amount,
        coveredAmount: null,
        remainingDemand: null,
        family: aggregated.demand.family,
        unit: aggregated.demand.unit,
        status: 'unknown',
      };
      return {
        identity: group.identity,
        name: group.name,
        indexes: group.entries.map(entry => entry.index),
        ...coverage,
      };
    });

    const positions = [
      ...legacyPositions,
      ...coverageGroups.flatMap(group => group.indexes.map(index => ({
        index,
        name: String(list[index]?.name || '').trim(),
        identity: group.identity,
        demand: group.demand,
        coveredAmount: group.coveredAmount,
        remainingDemand: group.remainingDemand,
        status: group.status,
      }))),
    ].sort((first, second) => first.index - second.index);
    return {
      groups: coverageGroups,
      positions,
      legacyPositions,
      coveredCount: coverageGroups.filter(group => group.status === 'covered').length,
      partialCount: coverageGroups.filter(group => group.status === 'partially-covered').length,
      unknownCount: coverageGroups.filter(group => group.status === 'unknown').length,
      incompatibleCount: coverageGroups.filter(group => group.status === 'incompatible').length,
    };
  }

  root.AngebotskuechePantryShoppingCoverageModel = Object.freeze({
    summarizeShoppingPantryCoverage,
  });
}(typeof window !== 'undefined' ? window : globalThis));

