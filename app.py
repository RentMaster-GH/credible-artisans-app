"""
CredibleArtisans.com - Multi-Country Artisan Directory & Job Marketplace Web App
Full Interactive App with Login Engine, Sponsored Campaigns, Paystack Checkout,
Supabase Database / Storage, Google Analytics, and Restricted Developer Support Inbox.
"""

import json
import os
import re
import urllib.parse
import uuid
from datetime import date, datetime, timedelta
import requests
import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv
from supabase import create_client
from streamlit.errors import StreamlitSecretNotFoundError

# ---------------------------------------------------------------------------
# Streamlit Config (MUST BE FIRST STREAMLIT COMMAND)
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="CredibleArtisans.com - Find Trusted Artisans Fast",
    page_icon="🛠️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Export for platforms like Vercel if needed
app = st

# Load environment variables
load_dotenv()


# Inject Google Analytics
def inject_google_analytics(measurement_id="G-EFD2P6FKM5"):
    ga_html = f"""
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={measurement_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{measurement_id}');
    </script>
    """
    components.html(ga_html, height=0, width=0)


inject_google_analytics("G-EFD2P6FKM5")


def get_secret(key: str, default: str = "") -> str:
    env_val = os.environ.get(key)
    if env_val:
        return env_val
    try:
        if key in st.secrets:
            return st.secrets[key]
    except StreamlitSecretNotFoundError:
        pass
    return default


SUPABASE_URL = get_secret("VITE_SUPABASE_URL") or get_secret("SUPABASE_URL")
SUPABASE_KEY = get_secret("VITE_SUPABASE_ANON_KEY") or get_secret("SUPABASE_KEY")
PAYSTACK_SECRET_KEY = get_secret("PAYSTACK_SECRET_KEY")
DEVELOPER_PIN = get_secret("DEVELOPER_PIN", "admin123")  # Master PIN to unlock inbox


@st.cache_resource
def get_client():
    url = (SUPABASE_URL or "").strip()
    key = (SUPABASE_KEY or "").strip()
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception:
        return None


sb = get_client()

# ---------------------------------------------------------------------------
# Global Constants & Master Data
# ---------------------------------------------------------------------------
TRADES = [
    "Plumber", "Electrician", "Carpenter & Joiner", "Mason / Builder",
    "Painter & Decorator", "Air Conditioner (AC) Technician", "Tailor & Fashion Designer",
    "Auto Mechanic", "Welder & Fabricator", "Tiler", "POP Ceiling Specialist",
    "Satellite & TV Installer", "Catering & Chef", "Barber / Hairdresser", "Gardener / Landscaper"
]

COUNTRIES = {
    "Ghana": {"flag": "🇬🇭", "currency": "GHS", "symbol": "GH₵", "id_type": "Ghana Card"},
    "Nigeria": {"flag": "🇳🇬", "currency": "NGN", "symbol": "₦", "id_type": "NIN / Voter ID"},
    "Kenya": {"flag": "🇰🇪", "currency": "KES", "symbol": "KSh", "id_type": "National ID"},
    "South Africa": {"flag": "🇿🇦", "currency": "ZAR", "symbol": "R", "id_type": "National ID"},
    "United Kingdom": {"flag": "🇬🇧", "currency": "GBP", "symbol": "£", "id_type": "Passport / Driving License"},
    "United States": {"flag": "🇺🇸", "currency": "USD", "symbol": "$", "id_type": "State ID / Driver License"},
    "Other / Global": {"flag": "🌐", "currency": "USD", "symbol": "$", "id_type": "Passport / National ID"}
}

PRIMARY_CITIES = {
    "Ghana": ["Accra (East Legon, Osu, Spintex)", "Kumasi", "Takoradi", "Tema", "Tamale", "Cape Coast"],
    "Nigeria": ["Lagos (Ikeja, Lekki, Victoria Island)", "Abuja", "Port Harcourt", "Ibadan", "Kano"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
    "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds"],
    "United States": ["New York", "Houston", "Atlanta", "Los Angeles"],
    "Other / Global": ["International / Remote"]
}

# ---------------------------------------------------------------------------
# In-Memory Session State Fallback (Guarantees execution even without DB)
# ---------------------------------------------------------------------------
def init_mock_data():
    if "user" not in st.session_state:
        st.session_state.user = None

    if "mock_artisans" not in st.session_state:
        st.session_state.mock_artisans = [
            {
                "id": "art-001",
                "name": "Kwame Mensah",
                "trade": "Plumber",
                "country": "Ghana",
                "location": "Accra (East Legon, Osu, Spintex)",
                "phone": "+233241234567",
                "email": "kwame.plumbing@gmail.com",
                "bio": "Certified master plumber with 8+ years experience in residential pipe fitting, leak detection, water heater repair, and bathroom installations.",
                "price_min": 150.0,
                "price_max": 800.0,
                "rating": 4.9,
                "review_count": 28,
                "verified": True,
                "status": "approved",
                "id_card_url": "https://via.placeholder.com/300x200.png?text=Ghana+Card+Verified",
                "portfolio": [
                    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500",
                    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500"
                ]
            },
            {
                "id": "art-002",
                "name": "Emmanuel Okafor",
                "trade": "Electrician",
                "country": "Nigeria",
                "location": "Lagos (Ikeja, Lekki, Victoria Island)",
                "phone": "+2348039876543",
                "email": "emmanuel.sparks@gmail.com",
                "bio": "Expert electrician specializing in full house wiring, solar inverter installation, generator repairs, and fault troubleshooting.",
                "price_min": 10000.0,
                "price_max": 75000.0,
                "rating": 4.8,
                "review_count": 19,
                "verified": True,
                "status": "approved",
                "id_card_url": "https://via.placeholder.com/300x200.png?text=NIN+Verified",
                "portfolio": [
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500"
                ]
            }
        ]

    if "mock_jobs" not in st.session_state:
        st.session_state.mock_jobs = [
            {
                "id": "job-101",
                "title": "Need Ceiling Fan & Chandelier Installed in East Legon",
                "trade": "Electrician",
                "country": "Ghana",
                "location": "Accra (East Legon, Osu, Spintex)",
                "description": "Looking for a neat and certified electrician to fix 2 ceiling fans and 1 living room chandelier. Ladder required.",
                "budget": 350.0,
                "customer_name": "Kofi Addo",
                "customer_phone": "+233244001122",
                "status": "open",
                "created_at": str(date.today())
            }
        ]

    if "mock_bids" not in st.session_state:
        st.session_state.mock_bids = []

    if "mock_reviews" not in st.session_state:
        st.session_state.mock_reviews = []

    # RESTRICTED: CUSTOMER SERVICE & SUPPORT INBOX (Developer Access Only)
    if "mock_support_inbox" not in st.session_state:
        st.session_state.mock_support_inbox = [
            {
                "id": "sup-001",
                "type": "Complaint",
                "name": "Kofi Addo",
                "email": "kofi@gmail.com",
                "subject": "Artisan Arrived Late",
                "message": "Kwame Mensah rescheduled 2 hours past agreed time without notice.",
                "status": "Pending",
                "created_at": str(date.today())
            },
            {
                "id": "sup-002",
                "type": "App Suggestion",
                "name": "Sarah Mensah",
                "email": "sarah@gmail.com",
                "subject": "Add Mobile Money Direct Escrow",
                "message": "It would be great to have direct Mobile Money escrow holding on job bids.",
                "status": "Pending",
                "created_at": str(date.today())
            }
        ]

    if "mock_ads" not in st.session_state:
        st.session_state.mock_ads = [
            {
                "id": "ad-001",
                "business_name": "DeWalt Quality Tools Ghana",
                "ad_slot": "Login Page Sidebar Banner",
                "monthly_rate": 500.0,
                "start_date": str(date.today()),
                "end_date": str(date.today() + timedelta(days=30)),
                "destination_url": "https://www.dewalt.com",
                "creative_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
                "status": "paid",
                "reference": "AD-DEWALT001"
            }
        ]


init_mock_data()

# ---------------------------------------------------------------------------
# Database Sync Helpers (Supabase with Session State Fallback)
# ---------------------------------------------------------------------------
def fetch_all_artisans():
    if sb:
        try:
            r = sb.table("artisans").select("*").execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return st.session_state.mock_artisans


def fetch_all_jobs():
    if sb:
        try:
            r = sb.table("jobs").select("*").order("created_at", desc=True).execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return st.session_state.mock_jobs


def fetch_bids_for_job(job_id):
    if sb:
        try:
            r = sb.table("bids").select("*").eq("job_id", job_id).execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return [b for b in st.session_state.mock_bids if b.get("job_id") == job_id]


def fetch_reviews_for_artisan(artisan_id):
    if sb:
        try:
            r = sb.table("reviews").select("*").eq("artisan_id", artisan_id).execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return [r for r in st.session_state.mock_reviews if r.get("artisan_id") == artisan_id]


def fetch_support_inbox():
    """RESTRICTED: Fetches customer service tickets for developer/admin view only."""
    if sb:
        try:
            r = sb.table("support_tickets").select("*").order("created_at", desc=True).execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return st.session_state.mock_support_inbox


def fetch_all_ads():
    if sb:
        try:
            r = sb.table("ads").select("*").order("created_at", desc=True).execute()
            if r.data:
                return r.data
        except Exception:
            pass
    return st.session_state.mock_ads


# ---------------------------------------------------------------------------
# Paystack API Helpers
# ---------------------------------------------------------------------------
def initialize_paystack_payment(email: str, amount_in_main_unit: float, callback_url: str, metadata: dict = None, currency: str = "GHS"):
    if not PAYSTACK_SECRET_KEY:
        return {"status": False, "message": "PAYSTACK_SECRET_KEY is missing."}

    url = "https://api.paystack.co/transaction/initialize"
    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": email,
        "amount": int(round(amount_in_main_unit * 100)),
        "currency": currency,
        "callback_url": callback_url,
        "channels": ["card", "mobile_money", "bank_transfer"],
        "metadata": metadata or {}
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"status": False, "message": str(e)}


def verify_paystack_payment(reference: str):
    if not PAYSTACK_SECRET_KEY:
        return {"status": False, "message": "PAYSTACK_SECRET_KEY is missing."}

    url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"status": False, "message": str(e)}


def initialize_ad_payment(client_name: str, ad_position: str, amount_ghs: float, start_date: str, end_date: str, destination_url: str, creative_url: str, email: str, callback_url: str, user_id: str = None):
    reference = f"AD-{uuid.uuid4().hex[:10].upper()}"

    ad_payload = {
        "id": f"ad-{uuid.uuid4().hex[:6]}",
        "business_name": client_name,
        "ad_slot": ad_position,
        "monthly_rate": float(amount_ghs),
        "start_date": str(start_date),
        "end_date": str(end_date),
        "destination_url": destination_url,
        "creative_url": creative_url,
        "status": "pending_payment",
        "reference": reference,
    }

    if sb:
        try:
            sb.table("ads").insert(ad_payload).execute()
        except Exception:
            pass

    st.session_state.mock_ads.append(ad_payload)

    paystack_res = initialize_paystack_payment(
        email=email,
        amount_in_main_unit=amount_ghs,
        callback_url=callback_url,
        metadata={
            "type": "advert_placement",
            "business_name": client_name,
            "ad_slot": ad_position,
            "reference": reference,
            "user_id": user_id
        }
    )

    return paystack_res, reference


# ---------------------------------------------------------------------------
# Utility Helpers
# ---------------------------------------------------------------------------
def clean_phone_number(phone: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", phone)
    if cleaned.startswith("+"):
        return cleaned[1:]
    if cleaned.startswith("0") and len(cleaned) == 10:
        return "233" + cleaned[1:]
    return cleaned


def make_whatsapp_link(phone: str, message: str) -> str:
    clean_p = clean_phone_number(phone)
    encoded_msg = urllib.parse.quote(message)
    return f"https://wa.me/{clean_p}?text={encoded_msg}"


def render_header():
    st.markdown(
        """
        <div style="background: linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%); padding: 1.8rem 2rem; border-radius: 12px; margin-bottom: 1.5rem; color: white;">
            <h1 style="margin: 0; font-size: 2.2rem; color: #ffffff;">🛠️ CredibleArtisans.com</h1>
            <p style="margin: 0.4rem 0 0 0; color: #dbeafe; font-size: 1.05rem;">
                Find Verified & Trusted Plumbers, Electricians, Carpenters & Technicians Fast Worldwide.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )


# Global Paystack Payment Callback Verification Handler
def handle_paystack_callbacks():
    query_params = st.query_params
    ref_param = query_params.get("reference") or query_params.get("trxref")

    if not ref_param:
        return

    reference = str(ref_param)

    if reference.startswith("AD-"):
        with st.spinner("Verifying Sponsored Campaign Payment..."):
            verification = verify_paystack_payment(reference)
            if verification.get("status") and verification.get("data", {}).get("status") == "success":
                if sb:
                    try:
                        sb.table("ads").update({"status": "paid"}).eq("reference", reference).execute()
                    except Exception:
                        pass
                for ad in st.session_state.mock_ads:
                    if ad.get("reference") == reference:
                        ad["status"] = "paid"
                st.success(f"✅ Payment for Sponsored Campaign (Ref: `{reference}`) verified! Your banner is active on CredibleArtisans.com.")
            else:
                st.error("❌ Sponsored campaign payment verification failed or was cancelled.")
        st.query_params.clear()


handle_paystack_callbacks()


# =========================================================================
# LOGIN PAGE WITH SPONSORED CAMPAIGNS & ADVERT MANAGEMENT
# =========================================================================
def auth_page():
    render_header()
    st.markdown("### 🔒 Login or Launch Sponsored Campaigns")

    login_col, ad_col = st.columns([1, 1.1])

    # LEFT COLUMN: LOG IN / SIGN UP FORMS
    with login_col:
        with st.container(border=True):
            st.markdown("#### User Authentication")

            tab1, tab2 = st.tabs(["🔒 Log In", "📝 Create Account"])

            with tab1:
                email = st.text_input("Email Address", key="auth_login_email", placeholder="you@example.com")
                password = st.text_input("Password", type="password", key="auth_login_pw")
                remember_me = st.checkbox("Remember Me", value=True, key="auth_remember_me")

                if st.button("Log In", type="primary", use_container_width=True, key="auth_login_btn"):
                    if not email or not password:
                        st.error("Please enter both email and password.")
                    elif sb:
                        try:
                            res = sb.auth.sign_in_with_password({"email": email, "password": password})
                            if res.user:
                                st.session_state.user = {
                                    "email": res.user.email,
                                    "id": res.user.id,
                                    "is_logged_in": True
                                }
                                st.success("✅ Logged in successfully!")
                                st.rerun()
                        except Exception as e:
                            st.error(f"Login failed: {e}")
                    else:
                        st.session_state.user = {
                            "email": email,
                            "id": "mock-user-123",
                            "is_logged_in": True
                        }
                        st.success("✅ Logged in as Demo User!")
                        st.rerun()

                st.divider()

                if sb:
                    try:
                        res = sb.auth.sign_in_with_oauth({
                            "provider": "google",
                            "options": {"redirect_to": "https://www.credibleartisans.com"}
                        })
                        if res.url:
                            st.markdown(
                                f"""
                                <a href="{res.url}" target="_self" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 10px; border: 1px solid #dadce0; border-radius: 6px; background-color: white; color: #3c4043; font-weight: 500; text-decoration: none; font-size: 0.9rem;">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" width="18" height="18"> Continue with Google
                                </a>
                                """,
                                unsafe_allow_html=True
                            )
                    except Exception:
                        pass

            with tab2:
                new_email = st.text_input("Email Address", key="auth_signup_email")
                confirm_email = st.text_input("Confirm Email Address", key="auth_confirm_email")
                new_pw = st.text_input("Password", type="password", key="auth_signup_pw")
                confirm_pw = st.text_input("Confirm Password", type="password", key="auth_confirm_pw")
                account_type = st.radio("Account Type", ["Homeowner / Customer", "Artisan / Service Provider"], horizontal=True)

                if st.button("Create Account", type="primary", use_container_width=True, key="auth_signup_btn"):
                    if new_email != confirm_email:
                        st.error("Email addresses do not match.")
                    elif new_pw != confirm_pw:
                        st.error("Passwords do not match.")
                    elif len(new_pw) < 6:
                        st.error("Password must be at least 6 characters.")
                    elif sb:
                        try:
                            sb.auth.sign_up({"email": new_email, "password": new_pw})
                            st.success("🎉 Account created! Check your email to confirm.")
                        except Exception as e:
                            st.error(f"Sign up error: {e}")
                    else:
                        st.success("🎉 Account created! You can now log in.")

    # RIGHT COLUMN: SPONSORED CAMPAIGNS & ADVERT MANAGEMENT
    with ad_col:
        with st.container(border=True):
            st.markdown("#### 📢 Sponsored Campaigns & Ad Space")
            st.caption("Promote your tool brand, hardware shop, or service to thousands of homeowners & artisans.")

            tab_view_ads, tab_create_ad = st.tabs(["📢 Active Banners", "💳 Create & Pay for Advert"])

            with tab_view_ads:
                ads_list = fetch_all_ads()
                active_ads = [ad for ad in ads_list if ad.get("status") in ("paid", "active")]

                if not active_ads:
                    st.info("No active sponsored banners currently listed.")
                else:
                    for ad in active_ads:
                        with st.container(border=True):
                            st.markdown(f"##### {ad.get('business_name')}")
                            st.caption(f"Placement: {ad.get('ad_slot')}")
                            if ad.get("creative_url"):
                                st.image(ad.get("creative_url"), use_container_width=True)
                            if ad.get("destination_url"):
                                st.link_button("🌐 Visit Sponsor Website", ad.get("destination_url"), type="primary")

            with tab_create_ad:
                st.markdown("##### Launch a New Sponsored Campaign")

                if "ad_checkout_url" not in st.session_state:
                    st.session_state.ad_checkout_url = None
                if "ad_checkout_ref" not in st.session_state:
                    st.session_state.ad_checkout_ref = None

                with st.form("login_new_ad_form", clear_on_submit=False):
                    f1, f2 = st.columns(2)
                    with f1:
                        client_name = st.text_input("Business / Brand Name *", placeholder="e.g. Absa Bank / DeWalt Tools")
                        advertiser_email = st.text_input("Receipt / Contact Email *", placeholder="sales@brand.com")
                        ad_position = st.selectbox("Target Ad Placement *", [
                            "Login Page Sidebar Banner",
                            "Top Directory Header Banner",
                            "In-Feed Property Listing Sponsor"
                        ])
                        start_date = st.date_input("Start Date", value=date.today())

                    with f2:
                        target_url = st.text_input("Destination Web URL *", placeholder="https://brand.com")
                        creative_url = st.text_input("Banner Image URL *", placeholder="https://brand.com/banner.jpg")
                        pricing_rate = st.number_input("Monthly Slot Rate (GH₵) *", min_value=50.0, value=500.0, step=50.0)
                        end_date = st.date_input("End Date", value=date.today() + timedelta(days=30))

                    callback_url = st.text_input("Callback Base URL", value="https://www.credibleartisans.com")

                    campaign_days = (end_date - start_date).days
                    daily_rate = pricing_rate / 30.0
                    total_cost = daily_rate * max(1, campaign_days)

                    st.info(f"📅 **Duration:** {max(1, campaign_days)} days | **Total Cost:** GH₵ {total_cost:,.2f}")

                    submit_ad = st.form_submit_button("💳 Pay Now & Launch Campaign", type="primary", use_container_width=True)

                    if submit_ad:
                        if not client_name or not advertiser_email or not target_url or not creative_url:
                            st.error("Please fill in all required fields marked with *.")
                        elif end_date < start_date:
                            st.error("End date cannot be earlier than start date.")
                        else:
                            with st.spinner("Initializing Paystack checkout..."):
                                try:
                                    user_id = st.session_state.user.get("id") if st.session_state.user else None
                                    ps_res, ref = initialize_ad_payment(
                                        client_name=client_name,
                                        ad_position=ad_position,
                                        amount_ghs=total_cost,
                                        start_date=str(start_date),
                                        end_date=str(end_date),
                                        destination_url=target_url,
                                        creative_url=creative_url,
                                        email=advertiser_email,
                                        callback_url=callback_url,
                                        user_id=user_id
                                    )

                                    if ps_res.get("status"):
                                        st.session_state.ad_checkout_url = ps_res["data"]["authorization_url"]
                                        st.session_state.ad_checkout_ref = ref
                                        st.success("Campaign registered! Click the Pay button below to complete checkout.")
                                    else:
                                        st.error(f"Paystack Error: {ps_res.get('message')}")
                                except Exception as e:
                                    st.error(f"Error processing checkout: {e}")

                if st.session_state.ad_checkout_url:
                    st.markdown("---")
                    st.info(f"Reference Code: `{st.session_state.ad_checkout_ref}`")
                    st.link_button(
                        "👉 Proceed to Pay via Paystack (Card / MoMo)",
                        st.session_state.ad_checkout_url,
                        type="primary",
                        use_container_width=True
                    )


# ---------------------------------------------------------------------------
# SCREEN 1: Home & Artisan Directory
# ---------------------------------------------------------------------------
def page_directory():
    render_header()
    st.subheader("🔎 Search & Browse Verified Artisans")

    artisans = [a for a in fetch_all_artisans() if a.get("status") == "approved"]

    # Filter Bar
    with st.container(border=True):
        f_col1, f_col2, f_col3, f_col4 = st.columns([2, 2, 2, 2])

        with f_col1:
            selected_country = st.selectbox("Country", list(COUNTRIES.keys()), index=0)

        with f_col2:
            trades_options = ["All Trades"] + TRADES
            selected_trade = st.selectbox("Select Trade", trades_options)

        with f_col3:
            city_options = ["All Locations"] + PRIMARY_CITIES.get(selected_country, ["General"])
            selected_city = st.selectbox("City / Region", city_options)

        with f_col4:
            min_rating = st.slider("Minimum Rating ⭐", 1.0, 5.0, 1.0, step=0.5)

    # Filter Application
    filtered = []
    for a in artisans:
        if a.get("country") != selected_country and selected_country != "Other / Global":
            continue
        if selected_trade != "All Trades" and a.get("trade") != selected_trade:
            continue
        if selected_city != "All Locations" and selected_city not in a.get("location", ""):
            continue
        if float(a.get("rating", 0)) < min_rating:
            continue
        filtered.append(a)

    st.markdown(f"**Found {len(filtered)} verified artisan(s)** in `{selected_country}`")
    st.markdown("---")

    if not filtered:
        st.info("No artisans matching your search criteria yet. Post a job or select a different filter!")
        if st.button("➕ Post a Job Instead", type="primary"):
            st.session_state.active_nav = "Post a Job"
            st.rerun()
        return

    # Render Artisan Grid Cards
    for idx in range(0, len(filtered), 2):
        cols = st.columns(2)
        for col_idx, col in enumerate(cols):
            if idx + col_idx < len(filtered):
                artisan = filtered[idx + col_idx]
                curr_info = COUNTRIES.get(artisan.get("country", "Ghana"), COUNTRIES["Ghana"])
                symbol = curr_info["symbol"]

                with col:
                    with st.container(border=True):
                        c_top1, c_top2 = st.columns([3, 1])
                        with c_top1:
                            st.markdown(f"### {artisan.get('name')} {'✅' if artisan.get('verified') else ''}")
                            st.markdown(f"🛠️ **Trade:** `{artisan.get('trade')}`")
                            st.caption(f"📍 **Location:** {artisan.get('location')} ({artisan.get('country')})")
                        with c_top2:
                            st.metric("Rating", f"{artisan.get('rating', 5.0)} ⭐", f"{artisan.get('review_count', 0)} reviews")

                        st.write(f"*{artisan.get('bio', '')[:120]}...*")

                        price_range_str = f"{symbol} {artisan.get('price_min', 0):,.0f} - {symbol} {artisan.get('price_max', 0):,.0f}"
                        st.markdown(f"💰 **Base Rate:** `{price_range_str}`")

                        st.markdown("---")
                        btn_c1, btn_c2, btn_c3 = st.columns(3)

                        with btn_c1:
                            wa_msg = f"Hello {artisan.get('name')}, I found your profile on CredibleArtisans.com. I need your assistance with a job."
                            wa_url = make_whatsapp_link(artisan.get("phone", ""), wa_msg)
                            st.link_button("💬 WhatsApp", wa_url, use_container_width=True)

                        with btn_c2:
                            tel_url = f"tel:{artisan.get('phone')}"
                            st.link_button("📞 Call Now", tel_url, use_container_width=True)

                        with btn_c3:
                            if st.button("📄 Full Profile", key=f"view_prof_{artisan['id']}", type="primary", use_container_width=True):
                                st.session_state.selected_artisan_id = artisan["id"]
                                st.session_state.active_nav = "Artisan Profile"
                                st.rerun()


# ---------------------------------------------------------------------------
# SCREEN 2: Detailed Artisan Profile
# ---------------------------------------------------------------------------
def page_artisan_profile():
    render_header()

    artisan_id = st.session_state.get("selected_artisan_id")
    artisans = fetch_all_artisans()
    artisan = next((a for a in artisans if a["id"] == artisan_id), None)

    if not artisan:
        st.warning("No artisan selected. Return to directory to select one.")
        if st.button("⬅️ Back to Directory"):
            st.session_state.active_nav = "Find Artisans (Directory)"
            st.rerun()
        return

    curr_info = COUNTRIES.get(artisan.get("country", "Ghana"), COUNTRIES["Ghana"])
    symbol = curr_info["symbol"]

    if st.button("⬅️ Back to Directory"):
        st.session_state.active_nav = "Find Artisans (Directory)"
        st.rerun()

    with st.container(border=True):
        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown(f"# {artisan.get('name')} {'✅ Verified Artisan' if artisan.get('verified') else ''}")
            st.markdown(f"### 🛠️ {artisan.get('trade')}")
            st.markdown(f"📍 **Location:** {artisan.get('location')}, {artisan.get('country')}")
            st.markdown(f"📧 **Email:** `{artisan.get('email', 'N/A')}`")
            st.markdown(f"💰 **Estimated Rate:** `{symbol} {artisan.get('price_min', 0):,.2f} - {symbol} {artisan.get('price_max', 0):,.2f}`")

            st.markdown("#### 📝 About / Bio")
            st.write(artisan.get("bio", "No bio provided."))

        with col2:
            st.metric("Customer Rating", f"{artisan.get('rating', 5.0)} / 5.0 ⭐", f"{artisan.get('review_count', 0)} total reviews")

            st.markdown("---")
            st.markdown("##### Direct Contact Options")
            wa_msg = f"Hello {artisan.get('name')}, I found your profile on CredibleArtisans.com. I would like to inquire about your service."
            wa_url = make_whatsapp_link(artisan.get("phone", ""), wa_msg)

            st.link_button("💬 Chat on WhatsApp", wa_url, type="primary", use_container_width=True)
            st.link_button("📞 Call Artisan Directly", f"tel:{artisan.get('phone')}", use_container_width=True)

    # Portfolio Gallery Section
    st.markdown("### 📷 Past Work Portfolio Gallery")
    portfolio = artisan.get("portfolio", [])

    if portfolio:
        p_cols = st.columns(3)
        for i, img_url in enumerate(portfolio):
            with p_cols[i % 3]:
                st.image(img_url, caption=f"Work Sample {i+1}", use_container_width=True)
    else:
        st.info("No portfolio images uploaded by this artisan yet.")

    # Reviews & Ratings Section
    st.markdown("---")
    st.markdown("### ⭐ Customer Reviews & Ratings")

    reviews = fetch_reviews_for_artisan(artisan["id"])

    if reviews:
        for r in reviews:
            with st.container(border=True):
                r_c1, r_c2 = st.columns([3, 1])
                with r_c1:
                    st.markdown(f"**{r.get('customer_name', 'Verified Homeowner')}**")
                    st.caption(f"Date: {r.get('date', 'Recent')}")
                    st.write(r.get("comment", ""))
                with r_c2:
                    st.markdown(f"**{r.get('rating', 5)} / 5 ⭐**")
    else:
        st.info("No written reviews yet. Be the first customer to leave a review below!")

    # Submit Review Dialog / Form
    with st.expander("✍️ Leave a Review for this Artisan"):
        with st.form("review_form", clear_on_submit=True):
            reviewer_name = st.text_input("Your Name *")
            star_rating = st.slider("Rating (1 to 5 Stars)", 1, 5, 5)
            comment_text = st.text_area("Your Review / Feedback *")

            submit_rev = st.form_submit_button("Submit Review", type="primary")

            if submit_rev:
                if not reviewer_name or not comment_text:
                    st.error("Please enter your name and review comment.")
                else:
                    new_rev = {
                        "id": f"rev-{uuid.uuid4().hex[:6]}",
                        "artisan_id": artisan["id"],
                        "customer_name": reviewer_name,
                        "rating": star_rating,
                        "comment": comment_text,
                        "date": str(date.today())
                    }
                    if sb:
                        try:
                            sb.table("reviews").insert(new_rev).execute()
                        except Exception:
                            pass
                    st.session_state.mock_reviews.append(new_rev)
                    st.success("✅ Thank you! Your review has been submitted.")
                    st.rerun()


# ---------------------------------------------------------------------------
# SCREEN 3: Job Marketplace & Customer Post Job
# ---------------------------------------------------------------------------
def page_marketplace():
    render_header()
    st.subheader("📋 Job Marketplace")

    tab_browse, tab_post = st.tabs(["🔍 Browse Posted Jobs & Bids", "➕ Post a New Job"])

    with tab_browse:
        jobs = fetch_all_jobs()
        if not jobs:
            st.info("No open jobs posted yet. Be the first homeowner to post a job!")
        else:
            for job in jobs:
                with st.container(border=True):
                    j_col1, j_col2 = st.columns([3, 1])
                    with j_col1:
                        st.markdown(f"### {job.get('title')}")
                        st.caption(f"🛠️ **Category:** {job.get('trade')} | 📍 **Location:** {job.get('location')} ({job.get('country')}) | 📅 {job.get('created_at')}")
                        st.write(job.get("description", ""))
                        st.markdown(f"👤 **Posted by:** {job.get('customer_name', 'Customer')} ({job.get('customer_phone')})")

                    with j_col2:
                        curr_symbol = COUNTRIES.get(job.get("country", "Ghana"), COUNTRIES["Ghana"])["symbol"]
                        st.metric("Estimated Budget", f"{curr_symbol} {job.get('budget', 0):,.2f}")
                        badge_color = "green" if job.get('status') == "open" else "gray"
                        st.markdown(f"Status: :{badge_color}[**{str(job.get('status')).upper()}**]")

                    # Bids Section for this job
                    bids = fetch_bids_for_job(job["id"])
                    st.markdown(f"**Bids Submitted ({len(bids)})**")

                    if bids:
                        for bid in bids:
                            st.markdown(
                                f"""
                                <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 4px;">
                                    <b>{bid.get('artisan_name')}</b> bid <b>{curr_symbol} {bid.get('bid_amount', 0):,.2f}</b><br>
                                    <span style="font-size: 0.9rem; color: #475569;">"{bid.get('proposal')}"</span>
                                </div>
                                """,
                                unsafe_allow_html=True
                            )

                    # Bid Form for Artisans
                    with st.expander(f"🙋‍♂️ Place a Bid on this Job (For Artisans)"):
                        with st.form(key=f"bid_form_{job['id']}"):
                            art_name = st.text_input("Your Artisan Name *")
                            bid_price = st.number_input(f"Your Bid Amount ({curr_symbol}) *", min_value=1.0, value=float(job.get('budget', 100)))
                            proposal = st.text_area("Your Proposal / When can you start? *", placeholder="I can come today with my equipment...")

                            submit_bid = st.form_submit_button("Submit Bid", type="primary")

                            if submit_bid:
                                if not art_name or not proposal:
                                    st.error("Please fill in your name and proposal.")
                                else:
                                    new_bid = {
                                        "id": f"bid-{uuid.uuid4().hex[:6]}",
                                        "job_id": job["id"],
                                        "artisan_id": "art-custom",
                                        "artisan_name": art_name,
                                        "bid_amount": bid_price,
                                        "proposal": proposal,
                                        "created_at": str(date.today())
                                    }
                                    if sb:
                                        try:
                                            sb.table("bids").insert(new_bid).execute()
                                        except Exception:
                                            pass
                                    st.session_state.mock_bids.append(new_bid)
                                    st.success("✅ Bid placed successfully!")
                                    st.rerun()

    with tab_post:
        st.markdown("### 📝 Describe the Task / Repair Needed")
        st.caption("Artisans in your city will view your job request and send competitive quotes/bids.")

        with st.form("post_job_form", clear_on_submit=True):
            col_a, col_b = st.columns(2)

            with col_a:
                j_title = st.text_input("Job Title *", placeholder="e.g. Need ceiling fan fixed in East Legon")
                j_country = st.selectbox("Country *", list(COUNTRIES.keys()), index=0)
                j_trade = st.selectbox("Required Trade *", TRADES)

            with col_b:
                j_city = st.selectbox("City / Suburb *", PRIMARY_CITIES.get(j_country, ["General"]))
                j_budget = st.number_input(f"Estimated Budget ({COUNTRIES[j_country]['symbol']}) *", min_value=10.0, value=200.0, step=50.0)
                c_name = st.text_input("Your Full Name *", placeholder="Homeowner Name")

            c_phone = st.text_input("Your Phone Number / WhatsApp *", placeholder="+233 24 XXX XXXX")
            j_desc = st.text_area("Detailed Job Description *", help="Mention specific details, height, materials required, or preferred time.")

            submit_job = st.form_submit_button("🚀 Publish Job to Marketplace", type="primary", use_container_width=True)

            if submit_job:
                if not j_title or not c_name or not c_phone or not j_desc:
                    st.error("Please complete all required fields marked with *.")
                else:
                    new_job = {
                        "id": f"job-{uuid.uuid4().hex[:6]}",
                        "title": j_title,
                        "trade": j_trade,
                        "country": j_country,
                        "location": j_city,
                        "description": j_desc,
                        "budget": j_budget,
                        "customer_name": c_name,
                        "customer_phone": c_phone,
                        "status": "open",
                        "created_at": str(date.today())
                    }
                    if sb:
                        try:
                            sb.table("jobs").insert(new_job).execute()
                        except Exception:
                            pass
                    st.session_state.mock_jobs.insert(0, new_job)
                    st.success("🎉 Your job has been published! Artisans will begin bidding shortly.")
                    st.rerun()


# ---------------------------------------------------------------------------
# SCREEN 4: Artisan Onboarding & KYC Sign Up
# ---------------------------------------------------------------------------
def page_artisan_onboarding():
    render_header()
    st.subheader("👷‍♂️ Artisan Registration & Onboarding (KYC)")
    st.write("Join CredibleArtisans.com, get verified, and start receiving direct calls and job bids!")

    with st.form("onboarding_form", clear_on_submit=False):
        c1, c2 = st.columns(2)

        with c1:
            full_name = st.text_input("Full Name *", placeholder="e.g. Samuel Appiah")
            email = st.text_input("Email Address *", placeholder="samuel@gmail.com")
            phone = st.text_input("Phone Number / WhatsApp *", placeholder="+233241234567")
            country = st.selectbox("Operating Country *", list(COUNTRIES.keys()))

        with c2:
            trade = st.selectbox("Primary Trade / Skill *", TRADES)
            city = st.selectbox("City / Region *", PRIMARY_CITIES.get(country, ["General"]))
            min_price = st.number_input(f"Minimum Service Charge ({COUNTRIES[country]['symbol']}) *", min_value=10.0, value=100.0, step=50.0)
            max_price = st.number_input(f"Maximum Service Charge ({COUNTRIES[country]['symbol']}) *", min_value=50.0, value=1000.0, step=100.0)

        bio = st.text_area("Professional Bio & Skill Summary *", placeholder="Describe your experience, past projects, and guarantees...")

        st.markdown("---")
        st.markdown(f"##### 🆔 Identity Verification (KYC - {COUNTRIES[country]['id_type']})")
        st.caption("Upload a clear photo/scan of your official ID card to receive the '✅ Verified Artisan' badge.")

        id_file = st.file_uploader(f"Upload {COUNTRIES[country]['id_type']} (JPG, PNG, PDF)", type=["jpg", "png", "jpeg", "pdf"])
        portfolio_files = st.file_uploader("Upload Past Work Portfolio Photos (Multiple Allowed)", type=["jpg", "png", "jpeg"], accept_multiple_files=True)

        terms_check = st.checkbox("I confirm that the uploaded ID is valid and all information provided is accurate.")

        submit_signup = st.form_submit_button("Submit Profile for Verification", type="primary", use_container_width=True)

        if submit_signup:
            if not full_name or not email or not phone or not bio:
                st.error("Please complete all required fields marked with *.")
            elif not terms_check:
                st.warning("You must accept the verification agreement terms.")
            else:
                id_card_url = "https://via.placeholder.com/300x200.png?text=Pending+Admin+Review"
                portfolio_urls = []

                if id_file and sb:
                    try:
                        file_bytes = id_file.getvalue()
                        path = f"id_docs/{uuid.uuid4().hex}_{id_file.name}"
                        sb.storage.from_("artisan-docs").upload(path, file_bytes)
                        id_card_url = sb.storage.from_("artisan-docs").get_public_url(path)
                    except Exception:
                        pass

                new_artisan = {
                    "id": f"art-{uuid.uuid4().hex[:6]}",
                    "name": full_name,
                    "trade": trade,
                    "country": country,
                    "location": city,
                    "phone": phone,
                    "email": email,
                    "bio": bio,
                    "price_min": float(min_price),
                    "price_max": float(max_price),
                    "rating": 5.0,
                    "review_count": 0,
                    "verified": False,
                    "status": "pending",
                    "id_card_url": id_card_url,
                    "portfolio": portfolio_urls
                }

                if sb:
                    try:
                        sb.table("artisans").insert(new_artisan).execute()
                    except Exception:
                        pass

                st.session_state.mock_artisans.append(new_artisan)
                st.success("🎉 Registration submitted successfully to CredibleArtisans.com! Your profile is pending quick Admin ID verification.")
                st.balloons()


# ---------------------------------------------------------------------------
# SCREEN 5: CUSTOMER SUPPORT & FEEDBACK (PUBLIC FORM + RESTRICTED DEVELOPER INBOX)
# ---------------------------------------------------------------------------
def page_customer_support():
    render_header()
    st.subheader("🎧 Customer Service & Support Center")
    st.caption("Submit your complaints, user suggestions, or app feedback directly to the developer team.")

    # PUBLIC USER FORM (EVERYONE CAN USE THIS)
    with st.container(border=True):
        st.markdown("### ✍️ Send a Direct Message / Ticket")
        
        with st.form("public_support_form", clear_on_submit=True):
            f_col1, f_col2 = st.columns(2)
            with f_col1:
                user_name = st.text_input("Your Full Name *", placeholder="e.g. John Doe")
                user_email = st.text_input("Your Email Address *", placeholder="john@example.com")
            
            with f_col2:
                ticket_type = st.selectbox("Category / Type *", [
                    "Complaint", 
                    "App Suggestion / Feature Request", 
                    "General Feedback",
                    "Report Fraud / Artisan Conduct"
                ])
                subject = st.text_input("Subject / Title *", placeholder="e.g. Issue with booking / Feature idea")

            message = st.text_area("Detailed Message *", rows=4, placeholder="Please provide details about your issue, suggestion, or feedback...")

            st.info("🔒 **Privacy Guarantee:** Submissions are strictly confidential and sent directly to the app developer. Other users CANNOT view your message.")

            submit_ticket = st.form_submit_button("📩 Send Message Privately", type="primary", use_container_width=True)

            if submit_ticket:
                if not user_name or not user_email or not subject or not message:
                    st.error("Please fill in all required fields marked with *.")
                else:
                    new_ticket = {
                        "id": f"sup-{uuid.uuid4().hex[:6]}",
                        "type": ticket_type,
                        "name": user_name,
                        "email": user_email,
                        "subject": subject,
                        "message": message,
                        "status": "Pending",
                        "created_at": str(date.today())
                    }

                    if sb:
                        try:
                            sb.table("support_tickets").insert(new_ticket).execute()
                        except Exception:
                            pass

                    st.session_state.mock_support_inbox.insert(0, new_ticket)
                    st.success("✅ Thank you! Your ticket has been sent directly to the developer team.")

    # RESTRICTED DEVELOPER INBOX (LOCKED BEHIND PIN)
    st.markdown("---")
    with st.expander("🔒 Developer / Admin Inbox Portal (Restricted Access)"):
        st.caption("Enter your Developer PIN to view the Customer Service Support Inbox.")
        pin_input = st.text_input("Developer Master PIN", type="password", key="dev_pin_input_support")

        if pin_input == DEVELOPER_PIN:
            st.success("🔓 Developer Access Granted!")
            render_developer_support_inbox()
        elif pin_input:
            st.error("❌ Invalid Developer PIN. Access Denied.")


# Helper Component to Render the Developer Support Inbox (UPDATED WITH UNIQUE TAB KEYS)
def render_developer_support_inbox():
    st.markdown("### 📥 Customer Service Support Inbox")
    st.caption("Review complaints, user suggestions, and app feedback sent by users.")

    inbox = fetch_support_inbox()

    if not inbox:
        st.info("No customer tickets found in the inbox.")
        return

    # Filter tabs for Developer
    tab_all, tab_complaints, tab_suggestions, tab_feedback = st.tabs([
        f"All ({len(inbox)})",
        "Complaints Only",
        "App Suggestions",
        "General Feedback"
    ])

    def render_tickets_list(tickets, prefix="all"):
        if not tickets:
            st.info("No tickets under this category.")
            return

        for t in tickets:
            with st.container(border=True):
                col_x, col_y = st.columns([3, 1])

                with col_x:
                    st.markdown(f"#### [{t.get('type', 'Ticket')}] {t.get('subject')}")
                    st.caption(f"👤 **From:** {t.get('name')} (`{t.get('email')}`) | 📅 **Date:** {t.get('created_at')}")
                    st.write(f"💬 **Message:** {t.get('message')}")

                with col_y:
                    status = t.get("status", "Pending")
                    status_color = "green" if status == "Resolved" else "red"
                    st.markdown(f"Status: :{status_color}[**{status.upper()}**]")

                    if status != "Resolved":
                        if st.button("✅ Mark Resolved", key=f"res_sup_{prefix}_{t.get('id')}", type="primary", use_container_width=True):
                            t["status"] = "Resolved"
                            if sb:
                                try:
                                    sb.table("support_tickets").update({"status": "Resolved"}).eq("id", t["id"]).execute()
                                except Exception:
                                    pass
                            st.success("Ticket marked as Resolved!")
                            st.rerun()

    with tab_all:
        render_tickets_list(inbox, prefix="all")

    with tab_complaints:
        render_tickets_list([t for t in inbox if "Complaint" in t.get("type", "") or "Fraud" in t.get("type", "")], prefix="comp")

    with tab_suggestions:
        render_tickets_list([t for t in inbox if "Suggestion" in t.get("type", "")], prefix="sug")

    with tab_feedback:
        render_tickets_list([t for t in inbox if "Feedback" in t.get("type", "")], prefix="feed")


# ---------------------------------------------------------------------------
# SCREEN 6: Admin Verification & Control Portal
# ---------------------------------------------------------------------------
def page_admin():
    render_header()
    st.subheader("🛡️ Admin Verification & Control Portal")

    # Developer Verification Lock
    pin_input = st.text_input("Enter Admin / Developer PIN to unlock Portal", type="password", key="admin_portal_pin")

    if pin_input != DEVELOPER_PIN:
        st.warning("🔒 Please enter the correct Developer PIN (default: `admin123`) to view admin data.")
        return

    st.success("🔓 Authenticated as System Developer / Admin")

    # Metrics Overview
    all_artisans = fetch_all_artisans()
    all_jobs = fetch_all_jobs()
    all_tickets = fetch_support_inbox()
    pending_artisans = [a for a in all_artisans if a.get("status") == "pending"]
    approved_artisans = [a for a in all_artisans if a.get("status") == "approved"]
    pending_tickets = [t for t in all_tickets if t.get("status") == "Pending"]

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Artisans", len(all_artisans))
    m2.metric("Verified Active Artisans", len(approved_artisans))
    m3.metric("Pending KYC Reviews", len(pending_artisans), delta=f"{len(pending_artisans)} needs action" if pending_artisans else "Clean")
    m4.metric("Support Tickets", len(all_tickets), delta=f"{len(pending_tickets)} unresolved" if pending_tickets else "All Clean")

    st.markdown("---")

    tab_kyc, tab_support_inbox_admin = st.tabs([
        "⏳ Pending Artisan ID Verifications",
        "📥 Customer Service Support Inbox (Developer Restricted)"
    ])

    # TAB 1: KYC VERIFICATION
    with tab_kyc:
        if not pending_artisans:
            st.success("✅ All artisan registrations have been reviewed!")
        else:
            for p_art in pending_artisans:
                with st.container(border=True):
                    col_a, col_b, col_c = st.columns([2, 2, 1])

                    with col_a:
                        st.markdown(f"### {p_art.get('name')}")
                        st.markdown(f"🛠️ **Trade:** `{p_art.get('trade')}` | 📍 {p_art.get('location')}, {p_art.get('country')}")
                        st.markdown(f"📞 **Phone:** `{p_art.get('phone')}` | 📧 `{p_art.get('email')}`")
                        st.write(f"**Bio:** {p_art.get('bio')}")

                    with col_b:
                        st.markdown("##### 🆔 ID Card Submitted")
                        if p_art.get("id_card_url"):
                            st.image(p_art["id_card_url"], width=220, caption="Uploaded ID Document")

                    with col_c:
                        if st.button("✅ Approve & Verify", key=f"app_{p_art['id']}", type="primary", use_container_width=True):
                            p_art["status"] = "approved"
                            p_art["verified"] = True
                            if sb:
                                try:
                                    sb.table("artisans").update({"status": "approved", "verified": True}).eq("id", p_art["id"]).execute()
                                except Exception:
                                    pass
                            st.success(f"Approved {p_art['name']}!")
                            st.rerun()

                        if st.button("❌ Reject / Ban", key=f"rej_{p_art['id']}", type="secondary", use_container_width=True):
                            p_art["status"] = "rejected"
                            p_art["verified"] = False
                            if sb:
                                try:
                                    sb.table("artisans").update({"status": "rejected", "verified": False}).eq("id", p_art["id"]).execute()
                                except Exception:
                                    pass
                            st.warning(f"Rejected {p_art['name']}.")
                            st.rerun()

    # TAB 2: DEVELOPER/ADMIN SUPPORT INBOX
    with tab_support_inbox_admin:
        render_developer_support_inbox()


# ---------------------------------------------------------------------------
# Router & Main Execution Engine
# ---------------------------------------------------------------------------
if "active_nav" not in st.session_state:
    st.session_state.active_nav = "Find Artisans (Directory)"

NAVIGATION_MENU = {
    "Find Artisans (Directory)": page_directory,
    "Artisan Profile": page_artisan_profile,
    "Post a Job": page_marketplace,
    "Artisan Registration (KYC)": page_artisan_onboarding,
    "🎧 Customer Support & Feedback": page_customer_support,
    "🔒 Login / Sponsored Ads": auth_page,
    "Admin Verification Portal": page_admin,
}

with st.sidebar:
    st.markdown("## 🛠️ CredibleArtisans.com")
    st.caption("Global On-Demand Artisan Directory")

    selected_page = st.radio(
        "Navigate",
        list(NAVIGATION_MENU.keys()),
        index=list(NAVIGATION_MENU.keys()).index(st.session_state.active_nav) if st.session_state.active_nav in NAVIGATION_MENU else 0
    )
    st.session_state.active_nav = selected_page

    st.markdown("---")

    if st.session_state.user and st.session_state.user.get("is_logged_in"):
        st.write(f"👤 Logged in: **{st.session_state.user.get('email')}**")
        if st.button("Logout", key="sidebar_logout_btn", use_container_width=True):
            if sb:
                try:
                    sb.auth.sign_out()
                except Exception:
                    pass
            st.session_state.user = None
            st.success("Logged out successfully.")
            st.rerun()

    st.markdown("---")
    st.markdown("### 💙 Support & Sponsored Ads")
    st.info("Are you a supplier or tool brand? Promote your products on CredibleArtisans.com!")

    if st.button("💳 Sponsor / Launch Campaign", use_container_width=True):
        st.session_state.active_nav = "🔒 Login / Sponsored Ads"
        st.rerun()

    st.markdown("---")
    st.caption("CredibleArtisans.com v3.0 • Powered by Streamlit & Supabase")

# Execute Current Page Router
NAVIGATION_MENU[st.session_state.active_nav]()