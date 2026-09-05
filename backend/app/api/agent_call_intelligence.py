from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.models.lead import Lead
from backend.app.models.agent_call import AgentCall
from backend.app.models.user import User
from backend.app.utils.dependencies import get_current_user

from backend.app.services.agent_call import (
    get_agent_call,
)

from backend.app.services.agent_call_analysis import (
    build_transcript_text,
)

from backend.app.services.agent_call_intelligence import (
    analyze_call_intelligence,
    create_agent_call_intelligence,
    get_agent_call_intelligence,
    update_agent_call_intelligence,
)

from backend.app.services.pipeline_automation import (
    automate_pipeline_stage,
)

from backend.app.schemas.agent_call_intelligence import (
    AgentCallIntelligenceCreate,
    AgentCallIntelligenceUpdate,
    AgentCallIntelligenceResponse,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Call Intelligence"],
)


# ============================================================
# PHONE NORMALIZATION
# ============================================================

def normalize_phone(phone: str | None) -> str:
    """
    Normalize phone number.

    Examples:

    +1 555-000-0002
    +15550000002
    15550000002

    All become:

    15550000002
    """

    if not phone:
        return ""

    return "".join(
        char
        for char in str(phone)
        if char.isdigit()
    )


# ============================================================
# FIND MATCHING LEAD
# ============================================================

def find_matching_lead(
    db: Session,
    agent_call,
):
    print("\n")
    print("=" * 60)
    print("STARTING LEAD MATCHING")
    print("=" * 60)

    call_phone = normalize_phone(
        agent_call.caller_phone
    )

    print(
        "RAW CALL PHONE:",
        repr(agent_call.caller_phone),
    )

    print(
        "NORMALIZED CALL PHONE:",
        repr(call_phone),
    )

    print(
        "CALL ORGANIZATION ID:",
        agent_call.organization_id,
    )

    # --------------------------------------------------------
    # Check call phone
    # --------------------------------------------------------

    if not call_phone:

        print("NO CALL PHONE AVAILABLE")

        print("=" * 60)
        print("LEAD MATCHING END")
        print("=" * 60)

        return None

    # --------------------------------------------------------
    # Get leads from same organization
    # --------------------------------------------------------

    leads = (
        db.query(Lead)
        .filter(
            Lead.organization_id
            == agent_call.organization_id
        )
        .all()
    )

    print(
        "TOTAL LEADS IN ORGANIZATION:",
        len(leads),
    )

    # --------------------------------------------------------
    # Compare phone numbers
    # --------------------------------------------------------

    for lead in leads:

        lead_phone = normalize_phone(
            lead.phone
        )

        print("\n")
        print(
            "CHECKING LEAD:",
            lead.id,
        )

        print(
            "RAW LEAD PHONE:",
            repr(lead.phone),
        )

        print(
            "NORMALIZED LEAD PHONE:",
            repr(lead_phone),
        )

        print(
            "CALL PHONE:",
            repr(call_phone),
        )

        print(
            "LEAD ORGANIZATION:",
            lead.organization_id,
        )

        print(
            "PHONE MATCH:",
            call_phone == lead_phone,
        )

        # Skip empty phone

        if not lead_phone:

            print("LEAD HAS NO PHONE")

            continue

        # ----------------------------------------------------
        # Exact normalized phone match
        # ----------------------------------------------------

        if call_phone == lead_phone:

            print("\n")
            print("=" * 60)
            print("MATCH FOUND!")
            print("=" * 60)

            print(
                "MATCHED LEAD ID:",
                lead.id,
            )

            print(
                "LEAD PHONE:",
                lead.phone,
            )

            print(
                "LEAD STATUS:",
                lead.status,
            )

            print("=" * 60)
            print("LEAD MATCHING END")
            print("=" * 60)

            return lead

        print("NO MATCH WITH THIS LEAD")

    # --------------------------------------------------------
    # No matching lead
    # --------------------------------------------------------

    print("\n")
    print("=" * 60)
    print("NO LEAD FOUND")
    print("=" * 60)

    print("=" * 60)
    print("LEAD MATCHING END")
    print("=" * 60)

    return None


# ============================================================
# ANALYZE CALL INTELLIGENCE
# ============================================================

@router.post(
    "/{agent_id}/calls/{call_id}/intelligence",
    response_model=AgentCallIntelligenceResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_call_intelligence_endpoint(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    print("\n")
    print("=" * 60)
    print("CALL INTELLIGENCE START")
    print("=" * 60)

    print(
        "AGENT ID:",
        agent_id,
    )

    print(
        "CALL ID:",
        call_id,
    )

    # ========================================================
    # GET AGENT CALL
    # ========================================================

    agent_call = (
    db.query(AgentCall)
    .filter(
        AgentCall.id == call_id,
        AgentCall.agent_id == agent_id,
        AgentCall.organization_id == current_user.organization_id,
    )
    .first()
)

    # ========================================================
    # VALIDATE AGENT CALL
    # ========================================================

    if  not agent_call: 
        print("AGENT CALL NOT FOUND")
    raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    print("AGENT CALL FOUND")

    print(
        "CALLER PHONE:",
        agent_call.caller_phone,
    )

    print(
        "ORGANIZATION ID:",
        agent_call.organization_id,
    )

    # ========================================================
    # BUILD TRANSCRIPT
    # ========================================================

    transcript_text = build_transcript_text(
        db,
        call_id,
    )

    # ========================================================
    # CHECK TRANSCRIPT
    # ========================================================

    if not transcript_text:

        print("NO TRANSCRIPT AVAILABLE")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript available for this call",
        )

    print("TRANSCRIPT FOUND")

    print(
        "TRANSCRIPT LENGTH:",
        len(transcript_text),
    )

    # ========================================================
    # ANALYZE CALL WITH AI
    # ========================================================

    analysis = analyze_call_intelligence(
        transcript_text,
    )

    print("\n")
    print("=" * 60)
    print("AI ANALYSIS")
    print("=" * 60)

    print(
        "SENTIMENT:",
        analysis.get("sentiment"),
    )

    print(
        "LEAD SCORE:",
        analysis.get("lead_score"),
    )

    print(
        "LEAD TEMPERATURE:",
        analysis.get("lead_temperature"),
    )

    print(
        "CUSTOMER INTENT:",
        analysis.get("customer_intent"),
    )

    print(
        "OBJECTIONS:",
        analysis.get("objections"),
    )

    print(
        "BUYING SIGNALS:",
        analysis.get("buying_signals"),
    )

    print(
        "RECOMMENDED ACTION:",
        analysis.get("recommended_action"),
    )

    # ========================================================
    # FIND MATCHING LEAD
    # ========================================================

    lead = find_matching_lead(
        db,
        agent_call,
    )

    print("\n")

    print(
        "FINAL MATCHED LEAD:",
        lead.id if lead else None,
    )

    # ========================================================
    # AUTOMATIC PIPELINE UPDATE
    # ========================================================

    if lead:

        print("\n")
        print("=" * 60)
        print("RUNNING PIPELINE AUTOMATION")
        print("=" * 60)

        updated_lead = automate_pipeline_stage(
            db=db,
            lead=lead,
            lead_temperature=analysis.get(
                "lead_temperature"
            ),
            customer_intent=analysis.get(
                "customer_intent"
            ),
        )

        print("\n")

        print(
            "PIPELINE AUTOMATION COMPLETE"
        )

        print(
            "NEW LEAD STATUS:",
            updated_lead.status,
        )

        print("=" * 60)

    else:

        print("\n")
        print("=" * 60)
        print("NO LEAD FOUND")
        print("PIPELINE AUTOMATION SKIPPED")
        print("=" * 60)

    # ========================================================
    # CHECK EXISTING INTELLIGENCE
    # ========================================================

    existing_intelligence = (
        get_agent_call_intelligence(
            db,
            call_id,
        )
    )

    # ========================================================
    # UPDATE EXISTING INTELLIGENCE
    # ========================================================

    if existing_intelligence:

        print("\n")
        print("=" * 60)
        print("UPDATING EXISTING INTELLIGENCE")
        print("=" * 60)

        intelligence_data = (
            AgentCallIntelligenceUpdate(
                sentiment=analysis.get(
                    "sentiment"
                ),

                lead_score=analysis.get(
                    "lead_score"
                ),

                lead_temperature=analysis.get(
                    "lead_temperature"
                ),

                customer_intent=analysis.get(
                    "customer_intent"
                ),

                objections=analysis.get(
                    "objections"
                ),

                buying_signals=analysis.get(
                    "buying_signals"
                ),

                recommended_action=analysis.get(
                    "recommended_action"
                ),
            )
        )

        updated_intelligence = (
            update_agent_call_intelligence(
                db,
                existing_intelligence,
                intelligence_data,
            )
        )

        print("INTELLIGENCE UPDATED")

        print("\n")
        print("=" * 60)
        print("CALL INTELLIGENCE END")
        print("=" * 60)

        return updated_intelligence

    # ========================================================
    # CREATE NEW INTELLIGENCE
    # ========================================================

    print("\n")
    print("=" * 60)
    print("CREATING NEW INTELLIGENCE")
    print("=" * 60)

    intelligence_data = (
        AgentCallIntelligenceCreate(
            sentiment=analysis.get(
                "sentiment"
            ),

            lead_score=analysis.get(
                "lead_score"
            ),

            lead_temperature=analysis.get(
                "lead_temperature"
            ),

            customer_intent=analysis.get(
                "customer_intent"
            ),

            objections=analysis.get(
                "objections"
            ),

            buying_signals=analysis.get(
                "buying_signals"
            ),

            recommended_action=analysis.get(
                "recommended_action"
            ),
        )
    )

    created_intelligence = (
        create_agent_call_intelligence(
            db,
            call_id,
            intelligence_data,
        )
    )

    print("NEW INTELLIGENCE CREATED")

    print("\n")
    print("=" * 60)
    print("CALL INTELLIGENCE END")
    print("=" * 60)

    return created_intelligence