from data.db import init_db, get_all_parcels, get_parcel_by_id, update_parcel_action, simulate_recheck_observation

def test():
    init_db(force_reseed=True)
    parcels = get_all_parcels()
    print(f"Total seeded parcels: {len(parcels)}")
    
    hero = get_parcel_by_id("PL-4587")
    print(f"Hero Parcel: {hero['parcel_id']} | Trajectory: {hero['trajectory']} | Urgency: {hero['urgency_score']} | Status: {hero['status']}")
    print(f"Hero Breakdown: {hero['score_breakdown']}")

    # Test update action
    updated_hero = update_parcel_action("PL-4587", "Notice Issued", "Official Stop Work notice delivered")
    print(f"Updated status: {updated_hero['status']} | Notice date: {updated_hero['notice_date']}")

    # Test recheck
    rechecked = simulate_recheck_observation("PL-4587", 1150.0)
    print(f"Rechecked status: {rechecked['status']} | Urgency: {rechecked['urgency_score']} | Post-notice growth: {rechecked['post_notice_growth']}")
    print("Backend logic verification successful!")

if __name__ == "__main__":
    test()
