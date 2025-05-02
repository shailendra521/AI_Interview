import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const createResponse = async (payload: any) => {
  const { error, data } = await supabase
    .from("response")
    .insert({ ...payload })
    .select("id");

  if (error) {
    console.log(error);

    return [];
  }

  if (payload.interview_id) {
    try {
      const { data: interview } = await supabase
        .from("interview")
        .select("response_count")
        .eq("id", payload.interview_id)
        .single();
      
      if (interview) {
        const currentCount = interview.response_count || 0;
        const newCount = typeof currentCount === 'bigint' ? Number(currentCount) + 1 : currentCount + 1;
        
        await supabase
          .from("interview")
          .update({ response_count: newCount })
          .eq("id", payload.interview_id);
      }
    } catch (updateError) {
      console.error("Failed to update interview response count:", updateError);
    }
  }

  return data[0]?.id;
};

const saveResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllResponses = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("interview_id", interviewId)
      .or(`details.is.null, details->call_analysis.not.is.null`)
      .eq("is_ended", true)
      .order("created_at", { ascending: false });

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getResponseCountByOrganizationId = async (
  organizationId: string,
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("interview")
      .select("response(id)", { count: "exact", head: true }) // join + count
      .eq("organization_id", organizationId);

    return count ?? 0;
  } catch (error) {
    console.log(error);

    return 0;
  }
};

const getAllEmailAddressesForInterview = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`email`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getResponseByCallId = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .filter("call_id", "eq", id);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const deleteResponse = async (id: string) => {
  // First get the response to know which interview it belongs to
  const { data: response } = await supabase
    .from("response")
    .select("interview_id")
    .eq("call_id", id)
    .single();

  // Delete the response
  const { error, data } = await supabase
    .from("response")
    .delete()
    .eq("call_id", id);
    
  if (error) {
    console.log(error);
    return [];
  }

  // Decrement the interview's response_count if we found an interview_id
  if (response?.interview_id) {
    try {
      // Get current response count
      const { data: interview } = await supabase
        .from("interview")
        .select("response_count")
        .eq("id", response.interview_id)
        .single();
      
      // Decrement response count, but don't go below 0
      if (interview) {
        const currentCount = interview.response_count || 0;
        const newCount = Math.max(
          0, 
          typeof currentCount === 'bigint' ? Number(currentCount) - 1 : currentCount - 1
        );
        
        await supabase
          .from("interview")
          .update({ response_count: newCount })
          .eq("id", response.interview_id);
      }
    } catch (updateError) {
      console.error("Failed to update interview response count:", updateError);
    }
  }

  return data;
};

const updateResponse = async (payload: any, call_id: string) => {
  const { error, data } = await supabase
    .from("response")
    .update({ ...payload })
    .eq("call_id", call_id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

export const ResponseService = {
  createResponse,
  saveResponse,
  updateResponse,
  getAllResponses,
  getResponseByCallId,
  deleteResponse,
  getResponseCountByOrganizationId,
  getAllEmails: getAllEmailAddressesForInterview,
};
